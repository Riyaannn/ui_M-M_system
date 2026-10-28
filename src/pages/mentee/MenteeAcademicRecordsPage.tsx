import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbStore } from '../../services/dbStore';
import { academicService } from '../../services/academicService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, VerificationBadge, ResultBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { AcademicRecord, SemesterSummary } from '../../types';
import { 
  Award, 
  Plus, 
  FileCheck2, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Lock 
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
    if (!profile || !code || !name) {
      error('Subject Code and Subject Name are required');
      return;
    }

    const intVal = internal ? Number(internal) : null;
    const extVal = external ? Number(external) : null;
    const maxVal = Number(maxMarks) || 100;

    if (intVal != null && extVal != null && intVal + extVal > maxVal) {
      error('Total marks cannot exceed maximum marks');
      return;
    }

    setIsSubmitting(true);
    try {
      await academicService.submitRecord(
        {
          mentee_id: profile.id,
          semester: Number(sem) || 5,
          academic_year: year,
          subject_code: code.trim().toUpperCase(),
          subject_name: name.trim(),
          credits: Number(credits) || 3.0,
          internal_marks: intVal,
          external_marks: extVal,
          total_marks: (intVal != null && extVal != null) ? intVal + extVal : null,
          maximum_marks: maxVal,
          grade: null,
          result_status: 'PENDING',
        },
        profile.id
      );

      success('Marks submitted. Record is currently pending administrative verification.');
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

  const summaries = academicService.calculateSummaries(records);

  // Performance chart data
  const chartData = records.map(r => ({
    name: r.subject_code,
    fullName: r.subject_name,
    Internal: r.internal_marks ?? 0,
    External: r.external_marks ?? 0,
    Total: r.total_marks ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-nmam-teal-600" />
            My Academic Records & Examination Dossier
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official semester results, SGPA calculation, and draft examination submissions
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsSubmitModalOpen(true)}
        >
          Submit Examination Marks
        </Button>
      </div>

      {/* Verification Rule Notice */}
      <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-start gap-3">
        <FileCheck2 className="w-5 h-5 text-sky-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Official Examination Policy:</span> Marks submitted by students are placed in <span className="font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Pending Verification</span> until audited and published by the NMAMIT Academic Office. Once officially verified, records are locked and cannot be edited.
        </div>
      </div>

      {/* Semester Academic Summaries Cards */}
      {summaries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaries.map((s) => (
            <Card key={s.semester} className="bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-5 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    Semester {s.semester} Summary
                  </span>
                  <Badge variant={s.status === 'PASS' ? 'success' : s.status === 'FAIL' ? 'danger' : 'warning'} size="sm">
                    {s.status}
                  </Badge>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Total Subjects:</span>
                    <span className="font-semibold text-slate-800">{s.totalSubjects} ({s.passedSubjects} Passed)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Credits:</span>
                    <span className="font-semibold text-slate-800">{s.totalCredits}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Overall Percentage:</span>
                    <span className="font-semibold text-slate-800">
                      {s.percentage != null ? `${s.percentage}%` : 'Pending'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">SGPA:</span>
                    <span className="font-bold text-nmam-teal-700 text-sm">
                      {s.sgpa != null ? s.sgpa : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Performance Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-nmam-teal-600" />
              <CardTitle className="text-sm">Subject Marks Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Internal" fill="#0d9488" name="Internal (CIE)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="External" fill="#0f2438" name="External (SEE)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Subject Records ({records.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">CIE (Internal)</th>
                  <th className="py-3 px-4">SEE (External)</th>
                  <th className="py-3 px-4">Total / Max</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No examination marks registered. Click "Submit Examination Marks" above to enter your marks.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {r.subject_name}
                        <span className="block text-[10px] text-slate-400 font-mono">{r.subject_code}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">Sem {r.semester}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{r.credits}</td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        {r.internal_marks != null ? r.internal_marks : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        {r.external_marks != null ? r.external_marks : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {r.total_marks != null ? r.total_marks : '-'} / {r.maximum_marks}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{r.grade || '-'}</td>
                      <td className="py-3 px-4">
                        <ResultBadge status={r.result_status} />
                      </td>
                      <td className="py-3 px-4">
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

      {/* Submit Marks Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Semester Examination Marks"
        description="Enter draft examination scores for audit and administrative verification."
      >
        <form onSubmit={handleSubmitRecord} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 22CS501"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester</label>
              <select
                value={sem}
                onChange={(e) => setSem(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Software Engineering & Agile"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                step="0.5"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Internal (CIE)</label>
              <input
                type="number"
                value={internal}
                onChange={(e) => setInternal(e.target.value)}
                placeholder="e.g. 40"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">External (SEE)</label>
              <input
                type="number"
                value={external}
                onChange={(e) => setExternal(e.target.value)}
                placeholder="e.g. 45"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Maximum Marks</label>
            <input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-[11px]">
            <strong>Note:</strong> Submitted scores are reviewed by your administrator. You cannot edit verified marks.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" isLoading={isSubmitting}>
              Submit Marks for Audit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
