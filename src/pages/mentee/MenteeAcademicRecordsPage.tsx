import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbStore } from '../../services/dbStore';
import { academicService } from '../../services/academicService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, VerificationBadge, ResultBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { AcademicRecord, SemesterSummary } from '../../types';
import { 
  Award, 
  Plus, 
  FileCheck2, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Lock,
  Sparkles 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

export const MenteeAcademicRecordsPage: React.FC = () => {
  const { profile } = useAuth();
  const { success, error } = useToast();
  const [records, setRecords] = useState<AcademicRecord[]>([]);

  // Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [sem, setSem] = useState('5');
  const [year, setYear] = useState('2025-2026');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('3.0');
  const [internal, setInternal] = useState('');
  const [external, setExternal] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    if (!profile) return;
    const data = dbStore.getAcademicRecords(profile.id);
    setRecords(data);
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!code || !name) {
      error('Subject Code and Subject Name are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const intNum = internal ? Number(internal) : null;
      const extNum = external ? Number(external) : null;
      const maxNum = Number(maxMarks) || 100;
      let total: number | null = null;
      let res: 'PASS' | 'FAIL' | 'PENDING' = 'PENDING';

      if (intNum != null && extNum != null) {
        total = intNum + extNum;
        res = (total / maxNum) * 100 >= 40 ? 'PASS' : 'FAIL';
      }

      await academicService.submitRecord({
        mentee_id: profile.id,
        semester: Number(sem),
        academic_year: year,
        subject_code: code.toUpperCase(),
        subject_name: name,
        credits: Number(credits),
        internal_marks: intNum,
        external_marks: extNum,
        total_marks: total,
        maximum_marks: maxNum,
        grade: null,
        result_status: res,
      }, profile.id);

      success('Draft score submitted for administrative review & publishing');
      setIsSubmitModalOpen(false);
      setCode('');
      setName('');
      setInternal('');
      setExternal('');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to submit marks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const chartData = records
    .filter(r => r.internal_marks != null || r.external_marks != null)
    .map(r => ({
      subject: r.subject_code,
      internal: r.internal_marks || 0,
      external: r.external_marks || 0,
      total: r.total_marks || 0,
    }));

  const summaries = academicService.calculateSummaries(records);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Academic Performance &amp; Examination Records"
        subtitle="Review official SGPA and submit draft semester scores for administrative verification"
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <Award className="w-3.5 h-3.5 text-violet-400" />
            <span>Academic Performance Dossier &bull; NMAMIT, Nitte</span>
          </div>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsSubmitModalOpen(true)}
          >
            Submit Examination Draft
          </Button>
        }
      />

      {/* Verification Notice */}
      <div className="p-4 rounded-2xl bg-[#191521] border border-[#30263E] flex items-center gap-3 text-xs text-[#AAA2B8] shadow-card-dark">
        <Lock className="w-4 h-4 text-violet-400 flex-shrink-0" />
        <span>
          <strong className="text-[#F5F3FA]">Academic Integrity Standard:</strong> Submitted marks remain marked as <span className="text-amber-400 font-semibold">Pending Verification</span> until checked and locked by NMAMIT administration.
        </span>
      </div>

      {/* Performance Chart if records exist */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <CardTitle className="text-sm">Semester Internal &amp; External Marks</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30263E" />
                <XAxis dataKey="subject" stroke="#AAA2B8" fontSize={11} />
                <YAxis stroke="#AAA2B8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#191521',
                    borderColor: '#30263E',
                    borderRadius: '12px',
                    color: '#F5F3FA',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#AAA2B8' }} />
                <Bar dataKey="internal" name="CIE (Internal)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="external" name="SEE (External)" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Examination Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#30263E]/60 bg-[#12101A]/30 text-[#AAA2B8] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">CIE (Internal)</th>
                  <th className="py-3 px-4">SEE (External)</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30263E]/40">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#777084]">
                      No academic records submitted yet. Click above to submit examination draft marks.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-[#211A2D]/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#F5F3FA]">{r.subject_name}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-violet-300">{r.subject_code}</td>
                      <td className="py-3.5 px-4 text-[#AAA2B8] font-mono">{r.credits} cr</td>
                      <td className="py-3.5 px-4 text-[#F5F3FA] font-mono">{r.internal_marks ?? '-'}</td>
                      <td className="py-3.5 px-4 text-[#F5F3FA] font-mono">{r.external_marks ?? '-'}</td>
                      <td className="py-3.5 px-4 font-bold text-violet-300 font-mono">
                        {r.total_marks ?? '-'} / {r.maximum_marks}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#F5F3FA]">{r.grade || '-'}</td>
                      <td className="py-3.5 px-4">
                        <ResultBadge status={r.result_status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <VerificationBadge status={r.verification_status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Submit Draft Marks Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Examination Draft Marks"
        description="Submit your CIE or SEE scores for review by the academic administrator."
      >
        <form onSubmit={handleSubmitRecord} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                Semester *
              </label>
              <select
                value={sem}
                onChange={(e) => setSem(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()}>Semester {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                Academic Year *
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="22CS501"
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500 uppercase"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Database Management Systems"
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                Credits
              </label>
              <input
                type="number"
                step="0.5"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                CIE (Internal)
              </label>
              <input
                type="number"
                value={internal}
                onChange={(e) => setInternal(e.target.value)}
                placeholder="Max 50"
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                SEE (External)
              </label>
              <input
                type="number"
                value={external}
                onChange={(e) => setExternal(e.target.value)}
                placeholder="Max 50"
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#30263E]/60 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsSubmitModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Submit for Verification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
