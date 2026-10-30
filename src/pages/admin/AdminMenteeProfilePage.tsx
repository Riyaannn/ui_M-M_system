import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, VerificationBadge, ResultBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { dbStore } from '../../services/dbStore';
import { profileService } from '../../services/profileService';
import { academicService } from '../../services/academicService';
import { adminService } from '../../services/adminService';
import { UserProfile, AcademicRecord, AccessSettings } from '../../types';
import { 
  ArrowLeft, 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Award, 
  Plus, 
  ShieldCheck, 
  Edit3,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';

export const AdminMenteeProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile: currentAdmin } = useAuth();
  const { success, error } = useToast();

  const [mentee, setMentee] = useState<UserProfile | null>(null);
  const [mentors, setMentors] = useState<UserProfile[]>([]);
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [accessSettings, setAccessSettings] = useState<AccessSettings | null>(null);

  // Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);

  // Edit Profile Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [usn, setUsn] = useState('');
  const [semester, setSemester] = useState('5');
  const [mentorId, setMentorId] = useState('');

  // Add Record Form
  const [recSem, setRecSem] = useState('5');
  const [recYear, setRecYear] = useState('2025-2026');
  const [recCode, setRecCode] = useState('');
  const [recName, setRecName] = useState('');
  const [recCredits, setRecCredits] = useState('3.0');
  const [recInternal, setRecInternal] = useState('');
  const [recExternal, setRecExternal] = useState('');
  const [recMax, setRecMax] = useState('100');
  const [recGrade, setRecGrade] = useState('');

  const loadData = async () => {
    if (!id) return;
    const m = dbStore.getProfileById(id);
    if (m) {
      setMentee(m);
      setFullName(m.full_name);
      setEmail(m.email);
      setPhone(m.phone || '');
      setUsn(m.usn || '');
      setSemester(m.semester?.toString() || '5');
      setMentorId(m.mentor_id || '');
    }

    const mentorList = dbStore.getAllMentors();
    setMentors(mentorList);

    const acad = dbStore.getAcademicRecords(id);
    setRecords(acad);

    const settings = await adminService.getAccessSettings(id);
    setAccessSettings(settings);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!mentee) {
    return (
      <div className="p-8 text-center text-xs text-[#AAA2B8]">
        Loading student record or student not found...
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await profileService.updateProfile(
        mentee.id,
        {
          full_name: fullName,
          email,
          phone: phone ? phone.trim() : null,
          usn: usn ? usn.trim() : null,
          semester: Number(semester),
          mentor_id: mentorId || null,
        },
        currentAdmin?.id || 'admin'
      );

      success('Student profile records updated');
      setIsEditProfileOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    }
  };

  const handleAddAcademicRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recCode || !recName) {
      error('Subject Code and Subject Name are required');
      return;
    }

    try {
      const internal = recInternal ? Number(recInternal) : null;
      const external = recExternal ? Number(recExternal) : null;
      const max = Number(recMax) || 100;
      let total: number | null = null;
      let resultStatus: 'PASS' | 'FAIL' | 'PENDING' = 'PENDING';

      if (internal != null && external != null) {
        total = internal + external;
        resultStatus = (total / max) * 100 >= 40 ? 'PASS' : 'FAIL';
      }

      await academicService.submitRecord(
        {
          mentee_id: mentee.id,
          semester: Number(recSem),
          academic_year: recYear,
          subject_code: recCode.toUpperCase(),
          subject_name: recName,
          credits: Number(recCredits),
          internal_marks: internal,
          external_marks: external,
          total_marks: total,
          maximum_marks: max,
          grade: recGrade ? recGrade.toUpperCase() : null,
          result_status: resultStatus,
        },
        currentAdmin?.id || 'admin'
      );

      success('Academic record published and verified');
      setIsAddRecordOpen(false);
      setRecCode('');
      setRecName('');
      setRecInternal('');
      setRecExternal('');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to add academic record');
    }
  };

  const handleToggleAccessSetting = async (field: keyof AccessSettings) => {
    if (!accessSettings) return;
    const currentVal = accessSettings[field] as boolean;
    try {
      const updated = await adminService.updateAccessSettings(
        mentee.id,
        { [field]: !currentVal },
        currentAdmin?.id || 'admin'
      );
      setAccessSettings(updated);
      success(`Updated permission flag: ${field}`);
    } catch (err: any) {
      error(err.message || 'Failed to update access settings');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/admin/mentees">
          <Button size="sm" variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Mentees
          </Button>
        </Link>
      </div>

      <PageHeader
        title={mentee.full_name}
        subtitle="Student Academic Dossier &amp; Mentorship Tracking"
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
            <span>USN: {mentee.usn || 'Pending Official Assignment'} &bull; Semester {mentee.semester || 5}</span>
          </div>
        }
        actions={
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Edit3 className="w-4 h-4" />}
            onClick={() => setIsEditProfileOpen(true)}
          >
            Edit Student Profile
          </Button>
        }
      />

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Personal Dossier & Mentor Pairing */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ProfileAvatar name={mentee.full_name} size="md" />
                <div>
                  <CardTitle className="text-base">{mentee.full_name}</CardTitle>
                  <p className="text-xs text-[#AAA2B8] font-mono">
                    USN: {mentee.usn || 'Not assigned yet'}
                  </p>
                </div>
              </div>
              {mentee.is_active ? (
                <Badge variant="success" size="sm">Active Mentee</Badge>
              ) : (
                <Badge variant="danger" size="sm">Account Deactivated</Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#777084] font-semibold uppercase tracking-wider block text-[10px]">
                    Department &amp; Branch
                  </span>
                  <span className="font-semibold text-[#F5F3FA] mt-0.5 block">
                    {mentee.department} &bull; {mentee.branch}
                  </span>
                </div>
                <div>
                  <span className="text-[#777084] font-semibold uppercase tracking-wider block text-[10px]">
                    Current Semester
                  </span>
                  <span className="font-semibold text-[#F5F3FA] mt-0.5 block">
                    Semester {mentee.semester || 5}
                  </span>
                </div>
                <div>
                  <span className="text-[#777084] font-semibold uppercase tracking-wider block text-[10px]">
                    Institutional Email
                  </span>
                  <a href={`mailto:${mentee.email}`} className="font-semibold text-violet-300 underline mt-0.5 block">
                    {mentee.email}
                  </a>
                </div>
                <div>
                  <span className="text-[#777084] font-semibold uppercase tracking-wider block text-[10px]">
                    Contact Telephone
                  </span>
                  {mentee.phone ? (
                    <a href={`tel:${mentee.phone}`} className="font-semibold text-[#F5F3FA] hover:text-violet-300 mt-0.5 block">
                      {mentee.phone}
                    </a>
                  ) : (
                    <span className="text-[#777084] italic mt-0.5 block">No phone entered yet</span>
                  )}
                </div>
              </div>

              {/* Mentor Pairing Info */}
              <div className="pt-4 border-t border-[#30263E]/60 flex items-center justify-between bg-[#12101A] p-3.5 rounded-xl border border-[#30263E]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#F5F3FA]">
                      Assigned Mentor: {mentee.mentor?.full_name || 'None'}
                    </div>
                    <div className="text-[11px] text-[#AAA2B8]">
                      {mentee.mentor ? mentee.mentor.email : 'Mentee currently has no assigned faculty mentor.'}
                    </div>
                  </div>
                </div>
                {mentee.mentor && (
                  <Badge variant="info" size="sm">Active Supervision</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Access Settings & Privacy Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                <CardTitle className="text-base">Privacy &amp; Governance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-[#AAA2B8] text-[11px] leading-relaxed">
                Administrator controls over what the student and mentor can access or modify for this record.
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between p-3 rounded-xl border border-[#30263E] bg-[#12101A]">
                  <div>
                    <div className="font-semibold text-[#F5F3FA]">Student Self-Edit</div>
                    <div className="text-[10px] text-[#777084]">Can mentee edit personal info?</div>
                  </div>
                  <Button
                    size="sm"
                    variant={accessSettings?.allow_profile_edit ? 'primary' : 'secondary'}
                    className="text-xs py-1 px-2.5"
                    onClick={() => handleToggleAccessSetting('allow_profile_edit')}
                  >
                    {accessSettings?.allow_profile_edit ? 'Allowed' : 'Locked'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-[#30263E] bg-[#12101A]">
                  <div>
                    <div className="font-semibold text-[#F5F3FA]">Mentor Academic View</div>
                    <div className="text-[10px] text-[#777084]">Can mentor view marks?</div>
                  </div>
                  <Button
                    size="sm"
                    variant={accessSettings?.allow_academic_view ? 'primary' : 'secondary'}
                    className="text-xs py-1 px-2.5"
                    onClick={() => handleToggleAccessSetting('allow_academic_view')}
                  >
                    {accessSettings?.allow_academic_view ? 'Visible' : 'Hidden'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-[#30263E] bg-[#12101A]">
                  <div>
                    <div className="font-semibold text-[#F5F3FA]">Contact Disclosure</div>
                    <div className="text-[10px] text-[#777084]">Can mentor view phone/email?</div>
                  </div>
                  <Button
                    size="sm"
                    variant={accessSettings?.allow_contact_view ? 'primary' : 'secondary'}
                    className="text-xs py-1 px-2.5"
                    onClick={() => handleToggleAccessSetting('allow_contact_view')}
                  >
                    {accessSettings?.allow_contact_view ? 'Disclosed' : 'Restricted'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Academic Records Dossier */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Academic Records &amp; Results</CardTitle>
            <p className="text-xs text-[#AAA2B8] mt-0.5">
              Official and pending examination scores for {mentee.full_name}
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddRecordOpen(true)}
          >
            Add Verified Record
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#30263E]/60 bg-[#12101A]/30 text-[#AAA2B8] uppercase tracking-wider font-semibold text-[10px]">
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
              <tbody className="divide-y divide-[#30263E]/40">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#777084]">
                      No academic records submitted or recorded yet for this mentee.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-[#211A2D]/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#F5F3FA]">
                        {r.subject_name}
                        <span className="block text-[10px] font-mono text-violet-300">{r.subject_code}</span>
                      </td>
                      <td className="py-3 px-4 text-[#AAA2B8]">Sem {r.semester}</td>
                      <td className="py-3 px-4 text-[#AAA2B8] font-mono">{r.credits}</td>
                      <td className="py-3 px-4 font-mono text-[#F5F3FA]">
                        {r.internal_marks != null ? r.internal_marks : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#F5F3FA]">
                        {r.external_marks != null ? r.external_marks : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-violet-300">
                        {r.total_marks != null ? r.total_marks : '-'} / {r.maximum_marks}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#F5F3FA]">
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

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Mentee Profile"
        description="Update student demographic and academic administration records."
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Student Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              College Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                College USN
              </label>
              <input
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value.toUpperCase())}
                placeholder="4NM22CS..."
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Telephone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Leave blank or enter actual phone"
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Assigned Faculty Mentor
            </label>
            <select
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            >
              <option value="">Unassigned</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.department})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-[#30263E]/60 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditProfileOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Academic Record Modal */}
      <Modal
        isOpen={isAddRecordOpen}
        onClose={() => setIsAddRecordOpen(false)}
        title="Add Verified Academic Record"
        description="Publish an official examination score into the student dossier."
      >
        <form onSubmit={handleAddAcademicRecord} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                Semester *
              </label>
              <select
                value={recSem}
                onChange={(e) => setRecSem(e.target.value)}
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
                value={recYear}
                onChange={(e) => setRecYear(e.target.value)}
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
                value={recCode}
                onChange={(e) => setRecCode(e.target.value)}
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
                value={recName}
                onChange={(e) => setRecName(e.target.value)}
                placeholder="Database Management Systems"
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                Credits
              </label>
              <input
                type="number"
                step="0.5"
                value={recCredits}
                onChange={(e) => setRecCredits(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                CIE (Int)
              </label>
              <input
                type="number"
                value={recInternal}
                onChange={(e) => setRecInternal(e.target.value)}
                placeholder="Max 50"
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                SEE (Ext)
              </label>
              <input
                type="number"
                value={recExternal}
                onChange={(e) => setRecExternal(e.target.value)}
                placeholder="Max 50"
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                Letter Grade
              </label>
              <input
                type="text"
                value={recGrade}
                onChange={(e) => setRecGrade(e.target.value.toUpperCase())}
                placeholder="A / B+"
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500 uppercase"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#30263E]/60 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddRecordOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Verify &amp; Publish Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
