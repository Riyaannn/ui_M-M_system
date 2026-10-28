import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
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
        usn: usn ? usn.trim().toUpperCase() : null,
        semester: Number(semester) || 5,
        mentor_id: mentorId || null,
        department: 'Computer Science & Engineering',
        branch: 'B.Tech - CSE',
      }, currentAdmin?.id || 'admin');

      success(`Mentee account created for ${fullName}`);
      setIsCreateModalOpen(false);
      setFullName('');
      setEmail('');
      setPhone('');
      setUsn('');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to create mentee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignMentor = async () => {
    if (!selectedMenteeForAssign) return;
    try {
      await profileService.assignMentee(
        selectedMenteeForAssign.id, 
        targetMentorId || null, 
        currentAdmin?.id
      );
      success(`Updated mentor assignment for ${selectedMenteeForAssign.full_name}`);
      setIsAssignModalOpen(false);
      setSelectedMenteeForAssign(null);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update assignment');
    }
  };

  const handleToggleActive = async (mentee: UserProfile) => {
    try {
      await profileService.toggleActiveStatus(mentee.id, !mentee.is_active, currentAdmin?.id);
      success(`${mentee.full_name} is now ${!mentee.is_active ? 'Active' : 'Deactivated'}`);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update status');
    }
  };

  const handleExportCSV = () => {
    const allRecords = dbStore.getAcademicRecords();
    adminService.exportAcademicRecordsToCSV(allRecords);
    success('Academic records exported to CSV successfully');
  };

  // Filter mentees
  const filteredMentees = mentees.filter((m) => {
    const matchesSearch = 
      m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.usn && m.usn.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSemester = 
      selectedSemester === 'all' || 
      (m.semester && m.semester.toString() === selectedSemester);

    const matchesMentor = 
      selectedMentor === 'all' || 
      (selectedMentor === 'unassigned' ? !m.mentor_id : m.mentor_id === selectedMentor);

    return matchesSearch && matchesSemester && matchesMentor;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-nmam-navy-800" />
            Mentee Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            NMAMIT student directory, mentor pairings, and profile administration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>

          <Button
            variant="teal"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add Mentee
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, USN, or email..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-nmam-navy-600 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-nmam-navy-600 focus:outline-none text-slate-700"
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-nmam-navy-600 focus:outline-none text-slate-700"
              >
                <option value="all">All Mentors</option>
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
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Registered Mentees ({filteredMentees.length})</CardTitle>
            <span className="text-xs text-slate-400">
              Initial 6 Demonstration Students Included
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Mentee Name</th>
                  <th className="py-3 px-4">USN</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Assigned Mentor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMentees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No mentees match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMentees.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {m.full_name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {m.usn || <span className="text-slate-400 italic">Not added</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="truncate max-w-[150px]">{m.email}</div>
                        {m.phone ? (
                          <div className="text-[11px] text-slate-400">{m.phone}</div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No phone</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        Semester {m.semester || 5}
                      </td>
                      <td className="py-3 px-4">
                        {m.mentor ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-medium text-[11px] border border-sky-200">
                            <GraduationCap className="w-3 h-3" />
                            {m.mentor.full_name}
                          </span>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {m.is_active ? (
                          <Badge variant="success" size="sm">Active</Badge>
                        ) : (
                          <Badge variant="danger" size="sm">Inactive</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="py-1 px-2 text-xs"
                          onClick={() => {
                            setSelectedMenteeForAssign(m);
                            setTargetMentorId(m.mentor_id || '');
                            setIsAssignModalOpen(true);
                          }}
                          title="Assign Mentor"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </Button>

                        <Link to={`/admin/mentees/${m.id}`}>
                          <Button size="sm" variant="outline" className="py-1 px-2.5 text-xs">
                            Profile
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleActive(m)}
                          className={`py-1 px-2 text-xs ${m.is_active ? 'text-rose-600' : 'text-emerald-600'}`}
                        >
                          {m.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Mentor Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Faculty Mentor"
        description={`Select mentor for ${selectedMenteeForAssign?.full_name}`}
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Mentor</label>
            <select
              value={targetMentorId}
              onChange={(e) => setTargetMentorId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            >
              <option value="">-- No Mentor (Unassign) --</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.department})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" onClick={handleAssignMentor}>
              Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Mentee Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Mentee Account"
        description="Register a student into the NMAMIT Mentor–Mentee portal."
      >
        <form onSubmit={handleCreateMentee} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
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
              placeholder="e.g. student@nmamit.nitte.edu"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">College USN (Optional)</label>
              <input
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                placeholder="e.g. 4NM22CS099"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester</label>
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
            <label className="block font-semibold text-slate-700 mb-1">Contact Phone (Optional)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210 (leave empty if not available)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Personal contact details should not be invented; can be filled by mentee or admin later.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Mentor Assignment</label>
            <select
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            >
              <option value="">-- Assign Later --</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.department})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" isLoading={isSubmitting}>
              Create Mentee Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
