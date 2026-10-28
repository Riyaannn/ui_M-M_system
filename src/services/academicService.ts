import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbStore } from './dbStore';
import { AcademicRecord, SemesterSummary, VerificationStatus } from '../types';

export const academicService = {
  async getRecordsByMentee(menteeId: string): Promise<AcademicRecord[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('academic_records')
          .select('*, mentee:mentee_id(*)')
          .eq('mentee_id', menteeId)
          .order('semester', { ascending: true })
          .order('subject_code', { ascending: true });
        if (error) throw error;
        return data as AcademicRecord[];
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store', e);
      }
    }
    return dbStore.getAcademicRecords(menteeId);
  },

  async getAllPendingVerifications(): Promise<AcademicRecord[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('academic_records')
          .select('*, mentee:mentee_id(*)')
          .eq('verification_status', 'pending')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data as AcademicRecord[];
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store', e);
      }
    }
    return dbStore.getAcademicRecords().filter(r => r.verification_status === 'pending');
  },

  async submitRecord(
    record: Omit<AcademicRecord, 'id' | 'created_at' | 'updated_at' | 'verification_status'>,
    submittedBy: string
  ): Promise<AcademicRecord> {
    const payload = {
      ...record,
      verification_status: 'pending' as VerificationStatus,
      submitted_by: submittedBy,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('academic_records')
          .insert(payload)
          .select('*, mentee:mentee_id(*)')
          .single();
        if (error) throw error;
        dbStore.logAction(submittedBy, 'ACADEMIC_RECORD_SUBMITTED', 'ACADEMIC_RECORD', data.id, {
          subject_code: record.subject_code,
          mentee_id: record.mentee_id,
        });
        return data as AcademicRecord;
      } catch (e) {
        console.warn('Supabase insert failed, falling back to local store', e);
      }
    }

    const created = dbStore.createAcademicRecord({
      ...payload,
      verification_status: 'pending',
    });
    dbStore.logAction(submittedBy, 'ACADEMIC_RECORD_SUBMITTED', 'ACADEMIC_RECORD', created.id, {
      subject_code: record.subject_code,
      mentee_id: record.mentee_id,
    });
    return created;
  },

  async verifyRecord(
    recordId: string, 
    status: VerificationStatus, 
    verifiedBy: string,
    remarks?: string
  ): Promise<AcademicRecord> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('academic_records')
          .update({
            verification_status: status,
            verified_by: verifiedBy,
            updated_at: new Date().toISOString(),
          })
          .eq('id', recordId)
          .select('*, mentee:mentee_id(*)')
          .single();
        if (error) throw error;
        dbStore.logAction(verifiedBy, `ACADEMIC_RECORD_${status.toUpperCase()}`, 'ACADEMIC_RECORD', recordId, {
          status,
          remarks,
        });
        return data as AcademicRecord;
      } catch (e) {
        console.warn('Supabase verify failed, falling back to local store', e);
      }
    }

    const updated = dbStore.verifyAcademicRecord(recordId, status, verifiedBy);
    dbStore.logAction(verifiedBy, `ACADEMIC_RECORD_${status.toUpperCase()}`, 'ACADEMIC_RECORD', recordId, {
      status,
      remarks,
    });
    return updated;
  },

  async deleteRecord(recordId: string, actorId: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('academic_records')
          .delete()
          .eq('id', recordId);
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase delete failed, falling back to local store', e);
      }
    }
    dbStore.deleteAcademicRecord(recordId);
    dbStore.logAction(actorId, 'ACADEMIC_RECORD_DELETED', 'ACADEMIC_RECORD', recordId);
  },

  calculateSummaries(records: AcademicRecord[]): SemesterSummary[] {
    const semMap = new Map<number, AcademicRecord[]>();

    for (const rec of records) {
      const list = semMap.get(rec.semester) || [];
      list.push(rec);
      semMap.set(rec.semester, list);
    }

    const summaries: SemesterSummary[] = [];

    Array.from(semMap.entries())
      .sort(([a], [b]) => a - b)
      .forEach(([sem, semRecords]) => {
        let totalObtained = 0;
        let totalMax = 0;
        let totalCredits = 0;
        let passed = 0;
        let failed = 0;
        let pending = 0;
        let totalGradePointsWeighted = 0;
        let hasGradePoints = true;

        const academicYear = semRecords[0]?.academic_year || '2025-2026';

        semRecords.forEach(r => {
          totalCredits += Number(r.credits) || 3;
          if (r.verification_status !== 'verified') {
            pending++;
          } else {
            if (r.result_status === 'PASS') passed++;
            else if (r.result_status === 'FAIL') failed++;
            else pending++;
          }

          if (r.total_marks != null && r.maximum_marks > 0) {
            totalObtained += Number(r.total_marks);
            totalMax += Number(r.maximum_marks);
          }

          // Grading scale based on VTU / NMAMIT Autonomous credit system:
          // O (90-100): 10, A+ (80-89): 9, A (70-79): 8, B+ (60-69): 7, B (55-59): 6, C (50-54): 5, P (40-49): 4, F (<40): 0
          if (r.grade) {
            const gradePoints: Record<string, number> = {
              'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
            };
            const gp = gradePoints[r.grade.toUpperCase()];
            if (gp !== undefined) {
              totalGradePointsWeighted += gp * (Number(r.credits) || 3);
            } else {
              hasGradePoints = false;
            }
          } else {
            hasGradePoints = false;
          }
        });

        const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(2)) : null;
        const sgpa = (hasGradePoints && totalCredits > 0 && semRecords.length > 0)
          ? Number((totalGradePointsWeighted / totalCredits).toFixed(2))
          : null;

        summaries.push({
          semester: sem,
          academic_year: academicYear,
          totalSubjects: semRecords.length,
          passedSubjects: passed,
          failedSubjects: failed,
          pendingSubjects: pending,
          totalCredits,
          totalObtainedMarks: totalObtained,
          totalMaxMarks: totalMax,
          percentage,
          sgpa,
          status: failed > 0 ? 'FAIL' : (pending > 0 ? 'PENDING' : 'PASS'),
        });
      });

    return summaries;
  },
};
