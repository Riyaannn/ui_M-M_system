import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, VerificationBadge, ResultBadge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { dbStore } from '../../services/dbStore';
import { academicService } from '../../services/academicService';
import { AcademicRecord, VerificationStatus } from '../../types';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  User, 
  AlertTriangle 
} from 'lucide-react';

export const AdminVerificationsPage: React.FC = () => {
  const { profile: currentAdmin } = useAuth();
  const { success, error } = useToast();
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [filter, setFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');

  // Confirmation dialog
  const [selectedRecord, setSelectedRecord] = useState<AcademicRecord | null>(null);
  const [actionType, setActionType] = useState<VerificationStatus | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const loadData = async () => {
    const all = dbStore.getAcademicRecords();
    setRecords(all);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleActionClick = (record: AcademicRecord, type: VerificationStatus) => {
    setSelectedRecord(record);
    setActionType(type);
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRecord || !actionType) return;
    try {
      await academicService.verifyRecord(
        selectedRecord.id,
        actionType,
        currentAdmin?.id || 'admin',
        actionType === 'verified' ? 'Officially verified and published by administrator' : 'Rejected after examination audit'
      );

      success(
        `Academic record for ${selectedRecord.subject_code} marked as ${actionType.toUpperCase()}`,
        'Record Verified'
      );
      setIsConfirmOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || 'Verification update failed');
    }
  };

  const filteredRecords = records.filter((r) => {
    if (filter === 'all') return true;
    return r.verification_status === filter;
  });

  const pendingCount = records.filter(r => r.verification_status === 'pending').length;
  const verifiedCount = records.filter(r => r.verification_status === 'verified').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Examination Marks Verification"
        subtitle="Audit, verify, and permanently publish semester examination marks for NMAMIT students"
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <FileCheck2 className="w-3.5 h-3.5 text-violet-400" />
            <span>Academic Integrity Console &bull; NMAMIT, Nitte</span>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[#191521] border border-[#30263E]">
        <div className="flex rounded-xl bg-[#12101A] p-0.5 border border-[#30263E]">
          {(['pending', 'verified', 'rejected', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition capitalize ${
                filter === tab
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-[#AAA2B8] hover:text-[#F5F3FA]'
              }`}
            >
              {tab === 'pending' ? `Pending (${pendingCount})` : tab}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#AAA2B8] px-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified scores are locked against student and mentor edits.</span>
        </div>
      </div>

      {/* Verification Records Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#30263E]/60 bg-[#12101A]/30 text-[#AAA2B8] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Subject &amp; Code</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">CIE / SEE / Total</th>
                  <th className="py-3.5 px-4">Credits</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30263E]/40">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#777084]">
                      No academic records in "{filter}" status.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#211A2D]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <ProfileAvatar name={rec.mentee?.full_name || 'Student'} size="sm" />
                          <div>
                            <span className="font-semibold text-[#F5F3FA] block">
                              {rec.mentee?.full_name || 'Mentee'}
                            </span>
                            <span className="text-[10px] text-[#777084] font-mono">
                              {rec.mentee?.usn || rec.mentee?.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-violet-300 font-bold block">{rec.subject_code}</span>
                        <span className="text-[11px] text-[#AAA2B8]">{rec.subject_name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#AAA2B8]">
                        Sem {rec.semester} ({rec.academic_year})
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#F5F3FA]">
                          {rec.internal_marks != null && rec.external_marks != null ? (
                            <span>
                              {rec.internal_marks} + {rec.external_marks} = <strong className="text-violet-300">{rec.total_marks}</strong> / {rec.maximum_marks}
                            </span>
                          ) : (
                            <span>{rec.total_marks || 'N/A'}</span>
                          )}
                        </div>
                        {rec.result_status && <ResultBadge status={rec.result_status} />}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#AAA2B8]">{rec.credits} cr</td>
                      <td className="py-3.5 px-4">
                        <VerificationBadge status={rec.verification_status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {rec.verification_status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="primary"
                              className="text-xs py-1 px-2.5"
                              onClick={() => handleActionClick(rec, 'verified')}
                            >
                              Verify &amp; Publish
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="text-xs py-1 px-2"
                              onClick={() => handleActionClick(rec, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#777084] font-mono">
                            {rec.verification_status === 'verified' ? 'Published' : 'Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title={actionType === 'verified' ? 'Verify and Publish Marks' : 'Reject Draft Marks'}
        message={
          actionType === 'verified'
            ? `Confirm official verification of ${selectedRecord?.subject_code} (${selectedRecord?.subject_name}) for ${selectedRecord?.mentee?.full_name}? Once verified, marks are permanently locked against student and mentor modifications.`
            : `Reject the draft academic record for ${selectedRecord?.subject_code}? The student will be notified to review their submission.`
        }
        confirmText={actionType === 'verified' ? 'Verify & Lock' : 'Reject Submission'}
        variant={actionType === 'verified' ? 'primary' : 'danger'}
      />
    </div>
  );
};
