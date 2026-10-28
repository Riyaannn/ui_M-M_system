import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, VerificationBadge, ResultBadge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
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
      setSelectedRecord(null);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update record');
    }
  };

  const filteredRecords = records.filter((r) => {
    if (filter === 'all') return true;
    return r.verification_status === filter;
  });

  const pendingCount = records.filter(r => r.verification_status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-nmam-teal-600" />
            Academic Marks Verification & Publishing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enforce academic integrity by auditing and approving student examination submissions
          </p>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              filter === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              filter === 'verified'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Academic Policy Guard:</span> Mentees can submit draft marks from semester examinations, but they remain strictly in pending state. Once verified by an administrator, the official marks are locked and cannot be modified by students or mentors.
        </div>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Examination Records ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Internal</th>
                  <th className="py-3 px-4">External</th>
                  <th className="py-3 px-4">Total / Max</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      No examination records found matching the {filter} filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {r.mentee?.full_name || 'Student'}
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {r.mentee?.usn || r.mentee?.email}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {r.subject_name}
                        <span className="block text-[10px] text-slate-400 font-mono">{r.subject_code}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">Sem {r.semester}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{r.credits}</td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        {r.internal_marks != null ? r.internal_marks : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        {r.external_marks != null ? r.external_marks : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {r.total_marks != null ? r.total_marks : '-'} / {r.maximum_marks}
                      </td>
                      <td className="py-3 px-4">
                        <ResultBadge status={r.result_status} />
                      </td>
                      <td className="py-3 px-4">
                        <VerificationBadge status={r.verification_status} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        {r.verification_status === 'pending' ? (
                          <>
                            <Button
                              size="sm"
                              variant="teal"
                              className="py-1 px-2.5 text-xs"
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              onClick={() => handleActionClick(r, 'verified')}
                            >
                              Verify & Publish
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="py-1 px-2 text-xs"
                              onClick={() => handleActionClick(r, 'rejected')}
                              title="Reject record"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Action completed
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
        title={actionType === 'verified' ? 'Verify and Publish Academic Record' : 'Reject Academic Record'}
        message={
          actionType === 'verified'
            ? `Are you sure you want to officially verify and publish marks for ${selectedRecord?.subject_code} (${selectedRecord?.subject_name})? This will lock the record as authoritative.`
            : `Are you sure you want to reject the submitted marks for ${selectedRecord?.subject_code}? The student will need to re-submit.`
        }
        confirmText={actionType === 'verified' ? 'Verify Record' : 'Reject Record'}
        variant={actionType === 'verified' ? 'primary' : 'danger'}
      />
    </div>
  );
};
