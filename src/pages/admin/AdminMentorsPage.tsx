import React, { useState, useEffect } from 'react';
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
  GraduationCap, 
  Plus, 
  Mail, 
  Phone, 
  Users, 
  CheckCircle2, 
  XCircle,
  Building2,
  Calendar
} from 'lucide-react';

export const AdminMentorsPage: React.FC = () => {
  const { profile: currentAdmin } = useAuth();
  const { success, error } = useToast();
  const [mentors, setMentors] = useState<UserProfile[]>([]);
  const [mentees, setMentees] = useState<UserProfile[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New mentor form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [branch, setBranch] = useState('Faculty / Mentor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    const mentorList = dbStore.getAllMentors();
    const menteeList = dbStore.getAllMentees();
    setMentors(mentorList);
    setMentees(menteeList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      error('Full Name and Email are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createMentor({
        full_name: fullName,
        email,
        phone: phone ? phone.trim() : null,
        department,
        branch,
      }, currentAdmin?.id || 'admin');

      success(`Mentor account created for ${fullName}`, 'Mentor Added');
      setIsCreateModalOpen(false);
      setFullName('');
      setEmail('');
      setPhone('');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to create mentor account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (mentor: UserProfile) => {
    try {
      await profileService.toggleActiveStatus(mentor.id, !mentor.is_active, currentAdmin?.id);
      success(`Mentor ${mentor.full_name} is now ${!mentor.is_active ? 'Active' : 'Deactivated'}`);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-nmam-teal-600" />
            Mentor Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage faculty mentors and supervision assignments at NMAMIT, Nitte
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add New Faculty Mentor
        </Button>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mentors.map((mentor) => {
          const assignedMentees = mentees.filter((m) => m.mentor_id === mentor.id);

          return (
            <Card key={mentor.id} className="overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="bg-slate-50/50 pb-4">
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-nmam-navy-100 text-nmam-navy-800 flex items-center justify-center font-bold text-sm">
                        {mentor.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{mentor.full_name}</div>
                        <div className="text-xs text-slate-500">{mentor.department}</div>
                      </div>
                    </div>
                    {mentor.is_active ? (
                      <Badge variant="success" size="sm">Active</Badge>
                    ) : (
                      <Badge variant="danger" size="sm">Deactivated</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-4">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`mailto:${mentor.email}`} className="hover:text-nmam-navy-700 underline truncate">
                        {mentor.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {mentor.phone ? (
                        <a href={`tel:${mentor.phone}`} className="hover:text-nmam-navy-700">
                          {mentor.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No phone added yet</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{mentor.college}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                      <Users className="w-4 h-4 text-nmam-teal-600" />
                      <span>Assigned Mentees:</span>
                    </div>
                    <span className="font-bold text-sm text-nmam-navy-800 bg-nmam-navy-50 px-2 py-0.5 rounded-full">
                      {assignedMentees.length}
                    </span>
                  </div>

                  {assignedMentees.length > 0 && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1">Mentees list:</div>
                      <div className="flex flex-wrap gap-1">
                        {assignedMentees.map((m) => (
                          <span
                            key={m.id}
                            className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                          >
                            {m.full_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  ID: {mentor.id.substring(0, 8)}...
                </span>
                <Button
                  size="sm"
                  variant={mentor.is_active ? 'outline' : 'teal'}
                  onClick={() => handleToggleActive(mentor)}
                  className="text-xs py-1"
                >
                  {mentor.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Mentor Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Faculty Mentor"
        description="Register a faculty member at NMAMIT to act as a mentor."
      >
        <form onSubmit={handleCreateMentor} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Faculty Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Rajesh Kumar"
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
              placeholder="e.g. rajesh.mentor@nmamit.nitte.edu"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
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
              Personal contact details should only be entered when officially available.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Academic Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Designation / Role</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" isLoading={isSubmitting}>
              Create Mentor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
