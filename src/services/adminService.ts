import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbStore } from './dbStore';
import { AccessSettings, AuditLog, UserProfile } from '../types';

export interface AdminDashboardStats {
  totalMentees: number;
  totalMentors: number;
  activeUsers: number;
  unassignedMentees: number;
  pendingVerifications: number;
  accountsAwaitingSetup: number;
}

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const mentees = await dbStore.getAllMentees();
    const mentors = await dbStore.getAllMentors();
    const records = await dbStore.getAcademicRecords();

    const activeMentees = mentees.filter(m => m.is_active);
    const activeMentors = mentors.filter(m => m.is_active);
    const unassigned = mentees.filter(m => !m.mentor_id);
    const pendingVerifs = records.filter(r => r.verification_status === 'pending');
    // awaiting setup: missing USN or missing mentor
    const awaitingSetup = mentees.filter(m => !m.usn || !m.mentor_id || !m.phone);

    return {
      totalMentees: mentees.length,
      totalMentors: mentors.length,
      activeUsers: activeMentees.length + activeMentors.length,
      unassignedMentees: unassigned.length,
      pendingVerifications: pendingVerifs.length,
      accountsAwaitingSetup: awaitingSetup.length,
    };
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*, actor:actor_id(*)')
          .order('created_at', { ascending: false })
          .limit(100);
        if (error) throw error;
        return data as AuditLog[];
      } catch (e) {
        console.warn('Supabase audit logs query failed, falling back to local store', e);
      }
    }
    return dbStore.getAuditLogs();
  },

  async getAccessSettings(menteeId: string): Promise<AccessSettings> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('access_settings')
          .select('*')
          .eq('mentee_id', menteeId)
          .single();
        if (error) throw error;
        return data as AccessSettings;
      } catch (e) {
        console.warn('Supabase access settings query failed, falling back to local store', e);
      }
    }
    return dbStore.getAccessSettings(menteeId);
  },

  async updateAccessSettings(
    menteeId: string,
    updates: Partial<AccessSettings>,
    adminId: string
  ): Promise<AccessSettings> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('access_settings')
          .upsert({
            mentee_id: menteeId,
            ...updates,
            updated_by: adminId,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'mentee_id' })
          .select()
          .single();
        if (error) throw error;

        dbStore.logAction(adminId, 'ACCESS_SETTINGS_UPDATED', 'ACCESS_SETTINGS', menteeId, updates);
        return data as AccessSettings;
      } catch (e) {
        console.warn('Supabase access settings update failed, falling back to local store', e);
      }
    }

    const updated = dbStore.updateAccessSettings(menteeId, updates, adminId);
    dbStore.logAction(adminId, 'ACCESS_SETTINGS_UPDATED', 'ACCESS_SETTINGS', menteeId, updates);
    return updated;
  },

  async createMentee(
    data: {
      full_name: string;
      email: string;
      phone?: string | null;
      usn?: string | null;
      semester?: number;
      branch?: string;
      department?: string;
      mentor_id?: string | null;
    },
    adminId: string
  ): Promise<UserProfile> {
    const profile = dbStore.createProfile({
      ...data,
      role: 'mentee',
      college: 'NMAM Institute of Technology (NMAMIT), Nitte',
      is_active: true,
    });

    dbStore.logAction(adminId, 'USER_CREATED', 'PROFILE', profile.id, {
      role: 'mentee',
      email: data.email,
      name: data.full_name,
    });

    return profile;
  },

  async createMentor(
    data: {
      full_name: string;
      email: string;
      phone?: string | null;
      department?: string;
      branch?: string;
    },
    adminId: string
  ): Promise<UserProfile> {
    const profile = dbStore.createProfile({
      ...data,
      role: 'mentor',
      college: 'NMAM Institute of Technology (NMAMIT), Nitte',
      semester: null,
      usn: null,
      mentor_id: null,
      is_active: true,
    });

    dbStore.logAction(adminId, 'USER_CREATED', 'PROFILE', profile.id, {
      role: 'mentor',
      email: data.email,
      name: data.full_name,
    });

    return profile;
  },

  exportAcademicRecordsToCSV(records: any[]): void {
    if (!records || records.length === 0) return;

    const headers = [
      'Student Name',
      'USN',
      'Semester',
      'Academic Year',
      'Subject Code',
      'Subject Name',
      'Credits',
      'Internal Marks',
      'External Marks',
      'Total Marks',
      'Maximum Marks',
      'Grade',
      'Result Status',
      'Verification Status'
    ];

    const rows = records.map(r => [
      `"${r.mentee?.full_name || 'N/A'}"`,
      `"${r.mentee?.usn || 'N/A'}"`,
      r.semester,
      `"${r.academic_year}"`,
      `"${r.subject_code}"`,
      `"${r.subject_name}"`,
      r.credits,
      r.internal_marks ?? '',
      r.external_marks ?? '',
      r.total_marks ?? '',
      r.maximum_marks,
      `"${r.grade || ''}"`,
      `"${r.result_status}"`,
      `"${r.verification_status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NMAMIT_Academic_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

