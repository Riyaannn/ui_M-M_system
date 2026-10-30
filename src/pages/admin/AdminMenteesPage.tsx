import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { dbStore } from '../../services/dbStore';
import { adminService } from '../../services/adminService';
import { profileService } from '../../services/profileService';
import { UserProfile } from '../../types';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  GraduationCap, 
  Eye, 
  UserCheck,
  CheckCircle2,
  Mail,
  Phone
} from 'lucide-react';

export const AdminMenteesPage: React.FC = () => {
  const { profile: currentAdmin } = useAuth();
  const { success, error } = useToast();
  const [mentees, setMentees] = useState<UserProfile[]>([]);
  const [mentors, setMentors] = useState<UserProfile[]>([]);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedMentor, setSelectedMentor] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMenteeForAssign, setSelectedMenteeForAssign] = useState<UserProfile | null>(null);
  const [targetMentorId, setTargetMentorId] = useState<string>('');

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [usn, setUsn] = useState('');
  const [semester, setSemester] = useState('5');
  const [mentorId, setMentorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    const menteeList = dbStore.getAllMentees();
    const mentorList = dbStore.getAllMentors();
    setMentees(menteeList);
    setMentors(mentorList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMentee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      error('Full Name and Email are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createMentee({
        full_name: fullName,
        email,
        phone: phone ? phone.trim() : null,
        usn: usn ? usn.trim() : null,
        semester: Number(semester),
        department: 'Computer Science & Engineering',
        branch: 'B.E. Computer Science',
        mentor_id: mentorId || null,
      }, currentAdmin?.id || 'admin');

      success(`Mentee profile provisioned for ${fullName}`);
      setIsCreateModalOpen(false);
      setFullName('');
      setEmail('');
      setPhone('');
      setUsn('');
      setMentorId('');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to create mentee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAssignModal = (mentee: UserProfile) => {
    setSelectedMenteeForAssign(mentee);
    setTargetMentorId(mentee.mentor_id || '');
    setIsAssignModalOpen(true);
  };

  const handleAssignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenteeForAssign) return;

    try {
      await profileService.assignMentee(
        selectedMenteeForAssign.id,
        targetMentorId || null,
        currentAdmin?.id
      );

      success(`Updated mentor assignment for ${selectedMenteeForAssign.full_name}`);
      setIsAssignModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update assignment');
    }
  };

  const handleToggleActive = async (mentee: UserProfile) => {
    try {
      await profileService.toggleActiveStatus(mentee.id, !mentee.is_active, currentAdmin?.id);
      success(`Mentee ${mentee.full_name} is now ${!mentee.is_active ? 'Active' : 'Deactivated'}`);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to change status');
    }
  };

  const handleExportCSV = () => {
    const allRecords = dbStore.getAcademicRecords();
    adminService.exportAcademicRecordsToCSV(allRecords);
    success('Mentee academic records exported to CSV', 'Export Completed');
  };

  const filteredMentees = mentees.filter((m) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.full_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.usn && m.usn.toLowerCase().includes(q));

    const matchesSemester =
      selectedSemester === 'all' || m.semester?.toString() === selectedSemester;

    const matchesMentor =
      selectedMentor === 'all'
        ? true
        : selectedMentor === 'unassigned'
        ? !m.mentor_id
        : m.mentor_id === selectedMentor;

    return matchesSearch && matchesSemester && matchesMentor;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Student Mentees Directory"
        subtitle="Manage enrolled students, academic tracking, and cohort mentor allocations"
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <Users className="w-3.5 h-3.5 text-violet-400" />
            <span>M&amp;M Student Registry &bull; NMAMIT, Nitte</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Enroll Student
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#777084] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, USN, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-[#12101A] border border-[#30263E] rounded-xl text-xs text-[#F5F3FA] placeholder-[#777084] focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#12101A] border border-[#30263E] rounded-xl text-xs text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#12101A] border border-[#30263E] rounded-xl text-xs text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Faculty Mentors</option>
                <option value="unassigned">Unassigned Mentees</option>
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    Mentor: {m.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentees Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Registered Mentees ({filteredMentees.length})</CardTitle>
            <p className="text-xs text-[#AAA2B8] mt-0.5">
              Includes initial 6 demonstration students assigned to Mentor Anusha
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#30263E]/60 bg-[#12101A]/30 text-[#AAA2B8] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Mentee Name</th>
                  <th className="py-3 px-4">USN</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Assigned Mentor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30263E]/40">
                {filteredMentees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#777084]">
                      No mentees match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMentees.map((m) => (
                    <tr key={m.id} className="hover:bg-[#211A2D]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <ProfileAvatar name={m.full_name} size="sm" />
                          <span className="font-semibold text-[#F5F3FA]">{m.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-violet-300">
                        {m.usn || <span className="text-[#777084] italic">Pending</span>}
                      </td>
                      <td className="py-3 px-4 text-[#AAA2B8]">
                        <div className="truncate max-w-[150px]">{m.email}</div>
                        {m.phone ? (
                          <div className="text-[10px] text-[#777084]">{m.phone}</div>
                        ) : (
                          <span className="text-[10px] text-[#777084] italic">No phone added</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#AAA2B8]">
                        Semester {m.semester || 5}
                      </td>
                      <td className="py-3 px-4">
                        {m.mentor ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-medium text-[11px] border border-indigo-500/30">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {m.mentor.full_name}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#777084] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {m.is_active ? (
                          <Badge variant="success" size="sm">Active</Badge>
                        ) : (
                          <Badge variant="danger" size="sm">Deactivated</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/admin/mentees/${m.id}`}>
                            <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                              Profile
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs py-1 px-2.5"
                            onClick={() => handleOpenAssignModal(m)}
                            title="Assign Mentor"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add New Mentee Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Provision Student Mentee"
        description="Enroll an undergraduate student into the M&M system"
      >
        <form onSubmit={handleCreateMentee} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Riya Ann"
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] placeholder-[#777084] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Institutional Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. riya.ann@nmamit.nitte.edu"
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] placeholder-[#777084] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                USN (Optional)
              </label>
              <input
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value.toUpperCase())}
                placeholder="4NM22CS..."
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] placeholder-[#777084] focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
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
            <label className="block text-xs font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Assign to Faculty Mentor
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
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Enroll Mentee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Mentor Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Faculty Mentor"
        description={`Allocate a faculty mentor to ${selectedMenteeForAssign?.full_name}`}
      >
        <form onSubmit={handleAssignMentor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Select Faculty Mentor
            </label>
            <select
              value={targetMentorId}
              onChange={(e) => setTargetMentorId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            >
              <option value="">Unassigned (No Mentor)</option>
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
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
