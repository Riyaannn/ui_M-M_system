import React, { useState, useEffect } from 'react';
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
  GraduationCap, 
  Plus, 
  Mail, 
  Phone, 
  Users, 
  CheckCircle2, 
  XCircle,
  Building2,
  Calendar,
  Sparkles
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
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Mentor Administration"
        subtitle="Manage faculty mentors, departments, and mentoring cohorts at NMAMIT, Nitte"
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
            <span>Faculty Supervision &bull; NMAMIT, Nitte</span>
          </div>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add New Faculty Mentor
          </Button>
        }
      />

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mentors.map((mentor) => {
          const assignedMentees = mentees.filter((m) => m.mentor_id === mentor.id);

          return (
            <Card key={mentor.id} className="overflow-hidden flex flex-col justify-between hover:border-violet-500/40 transition">
              <div>
                <CardHeader className="bg-[#12101A]/60 pb-4 border-b border-[#30263E]/60">
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar name={mentor.full_name} size="md" />
                      <div>
                        <div className="font-bold text-sm text-[#F5F3FA]">{mentor.full_name}</div>
                        <div className="text-xs text-[#AAA2B8]">{mentor.department}</div>
                      </div>
                    </div>
                    {mentor.is_active ? (
                      <Badge variant="success" size="sm">Active</Badge>
                    ) : (
                      <Badge variant="danger" size="sm">Deactivated</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3.5 pt-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[#AAA2B8]">
                      <Mail className="w-3.5 h-3.5 text-[#777084]" />
                      <a href={`mailto:${mentor.email}`} className="hover:text-violet-300 underline truncate">
                        {mentor.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-[#AAA2B8]">
                      <Phone className="w-3.5 h-3.5 text-[#777084]" />
                      {mentor.phone ? (
                        <a href={`tel:${mentor.phone}`} className="hover:text-violet-300">
                          {mentor.phone}
                        </a>
                      ) : (
                        <span className="text-[#777084] italic">Contact not entered yet</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[#AAA2B8]">
                      <Building2 className="w-3.5 h-3.5 text-[#777084]" />
                      <span>{mentor.college}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#30263E]/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#AAA2B8]">
                      <Users className="w-4 h-4 text-violet-400" />
                      <span>Supervised Mentees:</span>
                    </div>
                    <span className="font-bold text-xs text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-full">
                      {assignedMentees.length} Students
                    </span>
                  </div>

                  {assignedMentees.length > 0 && (
                    <div className="bg-[#12101A] p-3 rounded-xl border border-[#30263E]/60">
                      <div className="text-[10px] uppercase font-bold text-[#777084] tracking-wider mb-1.5">
                        Assigned Cohort:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {assignedMentees.map((m) => (
                          <span
                            key={m.id}
                            className="text-[11px] bg-[#191521] text-[#F5F3FA] px-2.5 py-0.5 rounded-lg border border-[#30263E]"
                          >
                            {m.full_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-4 bg-[#12101A]/60 border-t border-[#30263E]/60 flex items-center justify-between text-xs">
                <span className="text-[#777084] text-[10px] font-mono">
                  ID: {mentor.id.substring(0, 8)}...
                </span>
                <Button
                  size="sm"
                  variant={mentor.is_active ? 'secondary' : 'primary'}
                  className="text-xs py-1 px-2.5"
                  onClick={() => handleToggleActive(mentor)}
                >
                  {mentor.is_active ? 'Deactivate' : 'Activate Account'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add New Mentor Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Provision Faculty Mentor"
        description="Create an authorized faculty account with mentoring capabilities"
      >
        <form onSubmit={handleCreateMentor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Raghavendra Rao"
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
              placeholder="e.g. mentor.name@nmamit.nitte.edu"
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] placeholder-[#777084] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Contact Phone (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Leave blank or enter verified official number"
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] placeholder-[#777084] focus:outline-none focus:border-violet-500"
            />
            <p className="text-[11px] text-[#777084] mt-1">
              Personal contact details remain uninvented; enter actual details later.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Academic Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            >
              <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
              <option value="Information Science & Engineering">Information Science &amp; Engineering</option>
              <option value="Electronics & Communication Engineering">Electronics &amp; Communication Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Biotechnology">Biotechnology</option>
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
              Create Mentor Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
