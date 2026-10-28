import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, VerificationBadge, ResultBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
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
  AlertCircle
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
    const p = dbStore.getProfileById(id);
    setMentee(p);
    if (p) {
      setFullName(p.full_name);
      setEmail(p.email);
      setPhone(p.phone || '');
      setUsn(p.usn || '');
      setSemester(p.semester ? p.semester.toString() : '5');
      setMentorId(p.mentor_id || '');
    }

    const mentorList = dbStore.getAllMentors();
    setMentors(mentorList);

    const acadRecords = await academicService.getRecordsByMentee(id);
    setRecords(acadRecords);

    const acc = await adminService.getAccessSettings(id);
    setAccessSettings(acc);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!mentee) {
    return (
      <div className="p-8 text-center text-slate-500">
        Mentee record not found.
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await profileService.updateProfile(mentee.id, {
        full_name: fullName,
        email,
        phone: phone ? phone.trim() : null,
        usn: usn ? usn.trim().toUpperCase() : null,
        semester: Number(semester) || 5,
        mentor_id: mentorId || null,
      }, currentAdmin?.id);

      success('Mentee profile updated successfully');
      setIsEditProfileOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    }
  };

  const handleAddOfficialRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recCode || !recName) {
      error('Subject code and subject name are required');
      return;
    }

    try {
      const internal = recInternal ? Number(recInternal) : null;
      const external = recExternal ? Number(recExternal) : null;
      const maxMarks = Number(recMax) || 100;
      const total = (internal != null && external != null) ? internal + external : null;

      const record = dbStore.createAcademicRecord({
        mentee_id: mentee.id,
        semester: Number(recSem) || 5,
        academic_year: recYear,
        subject_code: recCode.trim().toUpperCase(),
        subject_name: recName.trim(),
        credits: Number(recCredits) || 3.0,
        internal_marks: internal,
        external_marks: external,
        total_marks: total,
        maximum_marks: maxMarks,
        grade: recGrade ? recGrade.trim().toUpperCase() : null,
        result_status: (total != null && total >= maxMarks * 0.4) ? 'PASS' : 'PENDING',
        verification_status: 'verified', // Admin records are officially verified
        verified_by: currentAdmin?.id || 'admin',
        submitted_by: currentAdmin?.id || 'admin',
      });

      success(`Official academic record for ${recCode} added and published`);
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

  const summaries = academicService.calculateSummaries(records);

  return (
    <div className="space-y-6">
      {/* Back button & title */}
      <div className="flex items-center gap-3">
        <Link to="/admin/mentees">
          <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Mentees
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Student Profile & Academic Dossier
          </h1>
          <p className="text-xs text-slate-500">NMAMIT Institute of Technology, Nitte</p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-nmam-navy-900 text-white font-bold text-lg flex items-center justify-center">
                    {mentee.full_name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{mentee.full_name}</h2>
                    <p className="text-xs text-slate-500 font-mono">
                      USN: {mentee.usn || 'Not assigned yet'}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Department & Branch:</span>
                  <span className="font-semibold text-slate-800">{mentee.department} &bull; {mentee.branch}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Current Semester:</span>
                  <span className="font-semibold text-slate-800">Semester {mentee.semester || 5}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">College Email:</span>
                  <a href={`mailto:${mentee.email}`} className="font-semibold text-nmam-navy-700 underline">
                    {mentee.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Phone Number:</span>
                  {mentee.phone ? (
                    <a href={`tel:${mentee.phone}`} className="font-semibold text-slate-800 hover:text-nmam-navy-700">
                      {mentee.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No phone entered yet</span>
                  )}
                </div>
              </div>

              {/* Mentor pairing info */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/70 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-nmam-teal-600" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      Assigned Mentor: {mentee.mentor?.full_name || 'None'}
                    </div>
                    <div className="text-[11px] text-slate-500">
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

        {/* Access Settings & Privacy Controls */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <CardTitle>Privacy & Permissions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Administrator controls over what the mentee and mentor can view or edit for this student record.
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div>
                    <div className="font-semibold text-slate-800">Mentee Profile Editing</div>
                    <div className="text-[10px] text-slate-400">Can student edit personal fields?</div>
                  </div>
                  <button
                    onClick={() => handleToggleAccessSetting('allow_profile_edit')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                      accessSettings?.allow_profile_edit
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {accessSettings?.allow_profile_edit ? 'Allowed' : 'Restricted'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div>
                    <div className="font-semibold text-slate-800">Mentor Academic View</div>
                    <div className="text-[10px] text-slate-400">Can mentor inspect marks?</div>
                  </div>
                  <button
                    onClick={() => handleToggleAccessSetting('allow_academic_view')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                      accessSettings?.allow_academic_view
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {accessSettings?.allow_academic_view ? 'Allowed' : 'Restricted'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div>
                    <div className="font-semibold text-slate-800">Mentor Contact View</div>
                    <div className="text-[10px] text-slate-400">Can mentor view phone/email?</div>
                  </div>
                  <button
                    onClick={() => handleToggleAccessSetting('allow_contact_view')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                      accessSettings?.allow_contact_view
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {accessSettings?.allow_contact_view ? 'Allowed' : 'Restricted'}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Academic Records Dossier */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Academic Records & Results</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Official and pending academic records for {mentee.full_name}
            </p>
          </div>
          <Button
            size="sm"
            variant="teal"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddRecordOpen(true)}
          >
            Add Verified Record
          </Button>
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
                      No academic records submitted or recorded yet for this mentee.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {r.subject_name}
                        <span className="block text-[10px] font-mono text-slate-400">{r.subject_code}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">Sem {r.semester}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{r.credits}</td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        {r.internal_marks != null ? r.internal_marks : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        {r.external_marks != null ? r.external_marks : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
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

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Mentee Profile"
        description="Update student demographic and academic administration records."
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">College Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">College USN</label>
              <input
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                placeholder="e.g. 4NM22CS001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
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
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Faculty Mentor</label>
            <select
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            >
              <option value="">-- No Mentor (Unassigned) --</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.department})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Verified Academic Record Modal */}
      <Modal
        isOpen={isAddRecordOpen}
        onClose={() => setIsAddRecordOpen(false)}
        title="Add Verified Academic Record"
        description="Publish official examination results for this student."
      >
        <form onSubmit={handleAddOfficialRecord} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject Code *</label>
              <input
                type="text"
                required
                value={recCode}
                onChange={(e) => setRecCode(e.target.value)}
                placeholder="e.g. 22CS501"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester</label>
              <select
                value={recSem}
                onChange={(e) => setRecSem(e.target.value)}
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
              value={recName}
              onChange={(e) => setRecName(e.target.value)}
              placeholder="e.g. Operating Systems"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                step="0.5"
                value={recCredits}
                onChange={(e) => setRecCredits(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Internal (CIE)</label>
              <input
                type="number"
                value={recInternal}
                onChange={(e) => setRecInternal(e.target.value)}
                placeholder="e.g. 42"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">External (SEE)</label>
              <input
                type="number"
                value={recExternal}
                onChange={(e) => setRecExternal(e.target.value)}
                placeholder="e.g. 45"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Marks</label>
              <input
                type="number"
                value={recMax}
                onChange={(e) => setRecMax(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grade (O, A+, A, etc.)</label>
              <input
                type="text"
                value={recGrade}
                onChange={(e) => setRecGrade(e.target.value)}
                placeholder="e.g. A+"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none uppercase"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddRecordOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm">
              Save & Publish Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
