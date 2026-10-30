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
import { PageHeader } from '../../components/ui/PageHeader';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
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
  GraduationCap,
  MessageSquare
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

  const [unauthorizedAccess, setUnauthorizedAccess] = useState(false);

  const loadData = async () => {
    if (!id || !profile) return;
    const m = dbStore.getProfileById(id);

    // Strict account isolation: Verify student belongs to this mentor!
    if (m && m.mentor_id !== profile.id) {
      setUnauthorizedAccess(true);
      setMentee(null);
      return;
    }

    setUnauthorizedAccess(false);
    setMentee(m);

    if (!m) return;

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

  if (unauthorizedAccess) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center bg-[#191521] rounded-2xl border border-rose-500/30 shadow-2xl mt-12">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-[#F5F3FA]">Access Denied: Unassigned Mentee</h2>
        <p className="text-xs text-[#AAA2B8] mt-2 leading-relaxed">
          You are not authorized to access this student record because they are not assigned to your supervision cohort.
        </p>
        <div className="mt-6">
          <Link to="/mentor/mentees">
            <Button size="sm" variant="secondary" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Return to My Mentees
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!mentee) {
    return (
      <div className="p-8 text-center text-xs text-[#AAA2B8]">
        Loading student dossier...
      </div>
    );
  }

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await notesService.createNote({
        mentor_id: profile.id,
        mentee_id: mentee.id,
        title: noteTitle,
        note_content: noteContent,
        subject: noteSubject || null,
        visibility: noteVisibility,
      }, profile.id);

      success('Private observation note saved securely');
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
      success('Observation note removed');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to delete note');
    }
  };

  const handleCreateRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

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

      success(`Recommended study resource for ${mentee.full_name}`);
      setIsAddRecOpen(false);
      setRecTitle('');
      setRecSubject('');
      setRecDesc('');
      setRecUrl('');
      setRecFollowUp('');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to create recommendation');
    }
  };

  const canViewContact = access?.allow_contact_view ?? true;
  const canViewAcademic = access?.allow_academic_view ?? true;
  const summaries = academicService.calculateSummaries(records);
  const needsImprovement = academicService.identifyImprovementSubjects(records);

  const chartData = records
    .filter(r => r.internal_marks != null || r.external_marks != null)
    .map(r => ({
      subject: r.subject_code,
      internal: r.internal_marks || 0,
      external: r.external_marks || 0,
      total: r.total_marks || 0,
    }));

  const whatsappUrl = mentee.phone
    ? `https://wa.me/${mentee.phone.replace(/[^0-9]/g, '')}`
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/mentor/mentees">
          <Button size="sm" variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Mentees
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`${mentee.full_name} — Academic Dossier`}
        subtitle={`Supervised Undergraduate &bull; USN: ${mentee.usn || 'Pending Entry'}`}
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
            <span>Assigned Cohort Dossier &bull; NMAMIT, Nitte</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<StickyNote className="w-4 h-4 text-amber-400" />}
              onClick={() => setIsAddNoteOpen(true)}
            >
              Private Observation
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<BookMarked className="w-4 h-4" />}
              onClick={() => setIsAddRecOpen(true)}
            >
              Recommend Notes
            </Button>
          </div>
        }
      />

      {/* Student Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div>
              <span className="text-[#777084] font-semibold block uppercase tracking-wider text-[10px]">
                Student Name
              </span>
              <span className="text-sm font-bold text-[#F5F3FA] mt-0.5 block">{mentee.full_name}</span>
              <span className="block text-[11px] text-[#AAA2B8] mt-0.5">
                {mentee.department} &bull; Sem {mentee.semester || 5}
              </span>
            </div>

            <div>
              <span className="text-[#777084] font-semibold block uppercase tracking-wider text-[10px]">
                Institutional Email
              </span>
              <a href={`mailto:${mentee.email}`} className="text-violet-300 underline font-semibold mt-0.5 block truncate">
                {mentee.email}
              </a>
            </div>

            <div>
              <span className="text-[#777084] font-semibold block uppercase tracking-wider text-[10px]">
                Contact Number
              </span>
              {canViewContact ? (
                mentee.phone ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <a href={`tel:${mentee.phone}`} className="font-semibold text-[#F5F3FA] hover:text-violet-300">
                      {mentee.phone}
                    </a>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] bg-[#4ADEA8]/10 text-[#4ADEA8] px-2 py-0.5 rounded-md font-semibold border border-[#4ADEA8]/30 hover:bg-[#4ADEA8]/20 transition"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-[#777084] italic block mt-0.5">No phone number recorded</span>
                )
              ) : (
                <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-medium block mt-0.5">
                  Restricted by Administrator
                </span>
              )}
            </div>

            <div>
              <span className="text-[#777084] font-semibold block uppercase tracking-wider text-[10px]">
                Academic Summary
              </span>
              {summaries.length > 0 && summaries[0].sgpa ? (
                <div className="font-bold text-[#F5F3FA] text-sm mt-0.5">
                  SGPA: <span className="text-violet-300">{summaries[0].sgpa}</span> &bull; {summaries[0].percentage}%
                </div>
              ) : (
                <span className="text-[#777084] italic block mt-0.5">
                  SGPA Unavailable (Pending verified marks)
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Needs Improvement Alert */}
      {needsImprovement.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rose-200">
            <span className="font-bold">Intervention Recommended:</span> The student scored below 50% in the following subjects:
            <ul className="list-disc list-inside mt-1 space-y-0.5 font-medium text-rose-300">
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
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  <CardTitle className="text-sm">Semester Subject Marks Breakdown</CardTitle>
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

          {/* Academic Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Semester Examination Scores</CardTitle>
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
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30263E]/40">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-[#777084]">
                          No academic records recorded yet for this student.
                        </td>
                      </tr>
                    ) : (
                      records.map((r) => (
                        <tr key={r.id} className="hover:bg-[#211A2D]/50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#F5F3FA]">{r.subject_name}</td>
                          <td className="py-3 px-4 font-mono text-violet-300 font-bold">{r.subject_code}</td>
                          <td className="py-3 px-4 text-[#AAA2B8] font-mono">{r.credits}</td>
                          <td className="py-3 px-4 text-[#F5F3FA] font-mono">{r.internal_marks ?? '-'}</td>
                          <td className="py-3 px-4 text-[#F5F3FA] font-mono">{r.external_marks ?? '-'}</td>
                          <td className="py-3 px-4 font-bold text-violet-300 font-mono">
                            {r.total_marks ?? '-'} / {r.maximum_marks}
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
        <Card>
          <CardContent className="p-8 text-center text-[#777084] text-xs">
            Academic records view is restricted by administrator policy for this student.
          </CardContent>
        </Card>
      )}

      {/* Private Mentor Notes Section */}
      <Card className="border-amber-500/20">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-amber-400" />
            <div>
              <CardTitle className="text-sm">Confidential Mentor Observations</CardTitle>
              <p className="text-[11px] text-[#777084]">Strictly private to faculty and administrator eyes</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddNoteOpen(true)}
          >
            Add Observation
          </Button>
        </CardHeader>

        <CardContent className="space-y-3">
          {notes.length === 0 ? (
            <div className="text-xs text-[#777084] py-6 text-center">
              No private observations recorded yet for this mentee.
            </div>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F5F3FA]">{n.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#777084]">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      className="text-[#777084] hover:text-rose-400 transition"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[#AAA2B8] text-[11px] leading-relaxed whitespace-pre-wrap">
                  {n.note_content}
                </p>
                {n.subject && (
                  <span className="inline-block text-[10px] font-mono bg-[#191521] border border-[#30263E] text-violet-300 px-2 py-0.5 rounded">
                    Subject: {n.subject}
                  </span>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add Observation Note Modal */}
      <Modal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        title="Add Confidential Observation"
        description="Private notes visible only to faculty mentors and administrators."
      >
        <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Observation Title *
            </label>
            <input
              type="text"
              required
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Needs assistance with DBMS Normalization"
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Related Subject (Optional)
            </label>
            <input
              type="text"
              value={noteSubject}
              onChange={(e) => setNoteSubject(e.target.value)}
              placeholder="e.g. 22CS501 DBMS"
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Observation Details *
            </label>
            <textarea
              required
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter academic mentoring feedback, exam preparation observations..."
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-4 border-t border-[#30263E]/60 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddNoteOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Private Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Recommend Study Notes Modal */}
      <Modal
        isOpen={isAddRecOpen}
        onClose={() => setIsAddRecOpen(false)}
        title={`Recommend Study Material to ${mentee.full_name}`}
        description="Share lecture notes, reference PDFs, or targeted learning materials."
      >
        <form onSubmit={handleCreateRecommendation} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Material Title *
            </label>
            <input
              type="text"
              required
              value={recTitle}
              onChange={(e) => setRecTitle(e.target.value)}
              placeholder="e.g. Computer Networks Quick Revision Notes"
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                value={recSubject}
                onChange={(e) => setRecSubject(e.target.value)}
                placeholder="e.g. Computer Networks"
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                Resource Type
              </label>
              <select
                value={recType}
                onChange={(e) => setRecType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              >
                <option value="url">External URL / Portal</option>
                <option value="document">PDF Document</option>
                <option value="note">Study Note</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Resource URL (Optional)
            </label>
            <input
              type="url"
              value={recUrl}
              onChange={(e) => setRecUrl(e.target.value)}
              placeholder="https://example.com/notes.pdf"
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Instructions &amp; Description *
            </label>
            <textarea
              required
              rows={3}
              value={recDesc}
              onChange={(e) => setRecDesc(e.target.value)}
              placeholder="Read chapters 3 & 4 covering TCP/IP handshake before Friday..."
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-4 border-t border-[#30263E]/60 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddRecOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Assign Material
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
