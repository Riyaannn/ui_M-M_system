import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbStore } from '../../services/dbStore';
import { academicService } from '../../services/academicService';
import { notesService } from '../../services/notesService';
import { recommendationService } from '../../services/recommendationService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, VerificationBadge, ResultBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { UserProfile, AcademicRecord, MentorNote, AccessSettings, SemesterSummary } from '../../types';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Plus, 
  StickyNote, 
  BookMarked, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Trash2,
  ShieldAlert,
  GraduationCap
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

export const MentorMenteeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { success, error } = useToast();

  const [mentee, setMentee] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [notes, setNotes] = useState<MentorNote[]>([]);
  const [access, setAccess] = useState<AccessSettings | null>(null);

  // Modals
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isAddRecOpen, setIsAddRecOpen] = useState(false);

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSubject, setNoteSubject] = useState('');
  const [noteVisibility, setNoteVisibility] = useState<'private' | 'shared'>('private');

  // Recommendation form state
  const [recTitle, setRecTitle] = useState('');
  const [recSubject, setRecSubject] = useState('');
  const [recDesc, setRecDesc] = useState('');
  const [recType, setRecType] = useState<'url' | 'document' | 'note'>('url');
  const [recUrl, setRecUrl] = useState('');
  const [recFollowUp, setRecFollowUp] = useState('');

  const loadData = async () => {
    if (!id || !profile) return;
    const m = dbStore.getProfileById(id);
    setMentee(m);

    const acc = dbStore.getAccessSettings(id);
    setAccess(acc);

    if (acc.allow_academic_view) {
      const acad = await academicService.getRecordsByMentee(id);
      setRecords(acad);
    } else {
      setRecords([]);
    }

    const n = await notesService.getNotes(profile.id, id);
    setNotes(n);
  };

  useEffect(() => {
    loadData();
  }, [id, profile]);

  if (!mentee) {
    return <div className="p-8 text-center text-slate-500">Mentee not found.</div>;
  }

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteContent || !profile) return;

    try {
      await notesService.createNote({
        mentor_id: profile.id,
        mentee_id: mentee.id,
        title: noteTitle,
        note_content: noteContent,
        subject: noteSubject || null,
        visibility: noteVisibility,
      }, profile.id);

      success('Private mentor note saved');
      setIsAddNoteOpen(false);
      setNoteTitle('');
      setNoteContent('');
      setNoteSubject('');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to save note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!profile) return;
    try {
      await notesService.deleteNote(noteId, profile.id);
      success('Note removed');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to delete note');
    }
  };

  const handleCreateRec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle || !recSubject || !recDesc || !profile) return;

    try {
      await recommendationService.createRecommendation({
        mentor_id: profile.id,
        mentee_id: mentee.id,
        title: recTitle,
        subject: recSubject,
        description: recDesc,
        resource_type: recType,
        resource_url: recUrl || null,
        file_path: null,
        follow_up_date: recFollowUp || null,
      }, profile.id);

      success(`Recommendation assigned to ${mentee.full_name}`);
      setIsAddRecOpen(false);
      setRecTitle('');
      setRecSubject('');
      setRecDesc('');
      setRecUrl('');
    } catch (err: any) {
      error(err.message || 'Failed to create recommendation');
    }
  };

  const summaries = academicService.calculateSummaries(records);

  // Identify subjects needing improvement: e.g. total < 50% or internal < 20
  const needsImprovement = records.filter(r => {
    if (r.total_marks != null && r.maximum_marks) {
      const pct = (r.total_marks / r.maximum_marks) * 100;
      return pct < 50 || (r.internal_marks != null && r.internal_marks < 20);
    }
    return false;
  });

  // Chart data
  const chartData = records.map(r => ({
    name: r.subject_code,
    fullName: r.subject_name,
    Internal: r.internal_marks ?? 0,
    External: r.external_marks ?? 0,
    Total: r.total_marks ?? 0,
  }));

  const canViewContact = access ? access.allow_contact_view : true;
  const canViewAcademic = access ? access.allow_academic_view : true;

  const cleanPhone = mentee.phone ? mentee.phone.replace(/[^0-9]/g, '') : null;
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="space-y-6">
      {/* Back button & top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/mentor/mentees">
            <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Mentees
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {mentee.full_name} — Academic Dossier
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              USN: {mentee.usn || 'Pending Entry'} &bull; NMAMIT Nitte
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<StickyNote className="w-4 h-4 text-amber-600" />}
            onClick={() => setIsAddNoteOpen(true)}
          >
            Add Private Observation
          </Button>
          <Button
            size="sm"
            variant="teal"
            leftIcon={<BookMarked className="w-4 h-4" />}
            onClick={() => setIsAddRecOpen(true)}
          >
            Recommend Study Notes
          </Button>
        </div>
      </div>

      {/* Student Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Student Name
              </span>
              <span className="text-sm font-bold text-slate-900">{mentee.full_name}</span>
              <span className="block text-[11px] text-slate-500 mt-0.5">
                {mentee.department} &bull; Sem {mentee.semester || 5}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                College Email
              </span>
              <a href={`mailto:${mentee.email}`} className="text-nmam-navy-700 underline font-semibold mt-0.5 block truncate">
                {mentee.email}
              </a>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Contact Number
              </span>
              {canViewContact ? (
                mentee.phone ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <a href={`tel:${mentee.phone}`} className="font-semibold text-slate-800 hover:text-nmam-navy-700">
                      {mentee.phone}
                    </a>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-1.5 py-0.5 rounded font-semibold border border-emerald-200"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 italic block mt-0.5">No phone number recorded</span>
                )
              ) : (
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-medium block mt-0.5">
                  Restricted by Admin
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Academic Summary
              </span>
              {summaries.length > 0 && summaries[0].sgpa ? (
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  SGPA: {summaries[0].sgpa} &bull; {summaries[0].percentage}%
                </div>
              ) : (
                <span className="text-slate-400 italic block mt-0.5">
                  SGPA Unavailable (Requires verified credits)
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Needs Improvement Alert if any */}
      {needsImprovement.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900">
            <span className="font-bold">Intervention Recommended:</span> The student scored below 50% in the following subjects:
            <ul className="list-disc list-inside mt-1 space-y-0.5 font-medium">
              {needsImprovement.map(r => (
                <li key={r.id}>
                  {r.subject_name} ({r.subject_code}): {r.total_marks}/{r.maximum_marks} marks
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Academic Records & Performance Chart */}
      {canViewAcademic ? (
        <div className="space-y-6">
          {/* Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-nmam-teal-600" />
                  <CardTitle className="text-sm">Semester Subject Marks Breakdown</CardTitle>
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

          {/* Academic Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Verified & Pending Academic Records</CardTitle>
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
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          No academic records recorded yet for this mentee.
                        </td>
                      </tr>
                    ) : (
                      records.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {r.subject_name}
                            <span className="block text-[10px] font-mono text-slate-400">{r.subject_code}</span>
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
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {r.grade || '-'}
                          </td>
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
        </div>
      ) : (
        <Card className="bg-amber-50/50 border-amber-200">
          <CardContent className="p-8 text-center text-amber-900">
            <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <h4 className="font-bold text-sm">Academic Records Access Restricted</h4>
            <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
              The administrator has restricted mentor visibility for this student's marks. Please consult the NMAMIT Academic Office if access is required for counseling.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Private Mentor Notes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle className="text-sm">Private Mentor Observations & Notes</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Confidential notes stored privately for Mentor {profile?.full_name} (Not accessible to student)
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddNoteOpen(true)}
            >
              Add Observation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {notes.length === 0 ? (
            <div className="text-xs text-slate-400 py-6 text-center">
              No mentor notes recorded yet for this student. Click above to log mentoring notes.
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{note.title}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {note.note_content}
                </p>
                {note.subject && (
                  <div className="text-[11px] text-nmam-teal-700 font-semibold pt-1">
                    Subject / Context: {note.subject}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal: Add Note */}
      <Modal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        title="Add Private Mentor Observation"
        description="Log confidential mentoring interaction or counseling details for this student."
      >
        <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Observation Title *</label>
            <input
              type="text"
              required
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Mid-semester academic counseling review"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject / Focus Area</label>
            <input
              type="text"
              value={noteSubject}
              onChange={(e) => setNoteSubject(e.target.value)}
              placeholder="e.g. Algorithm Analysis or Time Management"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Observation Notes *</label>
            <textarea
              required
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter detailed counseling notes, recommended improvements, and student feedback..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddNoteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm">
              Save Private Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Recommend Study Notes */}
      <Modal
        isOpen={isAddRecOpen}
        onClose={() => setIsAddRecOpen(false)}
        title={`Recommend Study Material for ${mentee.full_name}`}
        description="Share learning resources, NPTEL modules, PDFs, or subject notes with this mentee."
      >
        <form onSubmit={handleCreateRec} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Recommendation Title *</label>
            <input
              type="text"
              required
              value={recTitle}
              onChange={(e) => setRecTitle(e.target.value)}
              placeholder="e.g. Dynamic Programming & Greedy Algorithms Masterclass"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Course / Subject Code *</label>
            <input
              type="text"
              required
              value={recSubject}
              onChange={(e) => setRecSubject(e.target.value)}
              placeholder="e.g. Algorithms (22CS501)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Guidance & Directions *</label>
            <textarea
              required
              rows={3}
              value={recDesc}
              onChange={(e) => setRecDesc(e.target.value)}
              placeholder="Explain why this material will help and what sections to practice..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Resource URL / External Link</label>
            <input
              type="url"
              value={recUrl}
              onChange={(e) => setRecUrl(e.target.value)}
              placeholder="https://nptel.ac.in/... or college drive link"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Follow-Up Date</label>
            <input
              type="date"
              value={recFollowUp}
              onChange={(e) => setRecFollowUp(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddRecOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm">
              Assign Recommendation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
