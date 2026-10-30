import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { dbStore } from '../../services/dbStore';
import { profileService } from '../../services/profileService';
import { UserProfile } from '../../types';
import { UserCheck, GraduationCap, Users, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export const AdminAssignmentsPage: React.FC = () => {
  const { profile: currentAdmin } = useAuth();
  const { success, error } = useToast();
  const [mentors, setMentors] = useState<UserProfile[]>([]);
  const [mentees, setMentees] = useState<UserProfile[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [selectedMenteeId, setSelectedMenteeId] = useState<string>('');

  const loadData = () => {
    const m = dbStore.getAllMentors();
    const s = dbStore.getAllMentees();
    setMentors(m);
    setMentees(s);
    if (m.length > 0 && !selectedMentorId) {
      setSelectedMentorId(m[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async () => {
    if (!selectedMenteeId) {
      error('Please select a student to assign');
      return;
    }

    try {
      const mentee = mentees.find(m => m.id === selectedMenteeId);
      const mentor = mentors.find(m => m.id === selectedMentorId);

      await profileService.assignMentee(
        selectedMenteeId,
        selectedMentorId || null,
        currentAdmin?.id || 'admin'
      );

      success(
        `Assigned ${mentee?.full_name} to Mentor ${mentor?.full_name || 'None'}`,
        'Assignment Updated'
      );
      setSelectedMenteeId('');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update assignment');
    }
  };

  const handleQuickReassign = async (menteeId: string, newMentorId: string | null) => {
    try {
      await profileService.assignMentee(menteeId, newMentorId, currentAdmin?.id || 'admin');
      success('Updated mentee assignment successfully');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update assignment');
    }
  };

  const activeMentor = mentors.find(m => m.id === selectedMentorId);
  const activeMentorCohort = mentees.filter(m => m.mentor_id === selectedMentorId);
  const unassignedMentees = mentees.filter(m => !m.mentor_id);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Mentor Cohort Allocation"
        subtitle="Pair undergraduate students with designated faculty mentors at NMAMIT, Nitte"
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <UserCheck className="w-3.5 h-3.5 text-violet-400" />
            <span>M&amp;M Cohort Governance</span>
          </div>
        }
      />

      {/* Allocation Tool Card */}
      <Card className="border-violet-500/30 shadow-glow-violet-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-violet-400" />
            <CardTitle>Assign Student to Mentor</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 space-y-1.5">
              <label className="block text-xs font-semibold text-[#AAA2B8] uppercase tracking-wider">
                Select Student Mentee
              </label>
              <select
                value={selectedMenteeId}
                onChange={(e) => setSelectedMenteeId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-xs text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              >
                <option value="">-- Choose student mentee --</option>
                {mentees.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} (Current: {m.mentor?.full_name || 'Unassigned'})
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:flex md:col-span-1 justify-center pb-2 text-[#777084]">
              <ArrowRight className="w-5 h-5" />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-semibold text-[#AAA2B8] uppercase tracking-wider">
                Target Faculty Mentor
              </label>
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-xs text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              >
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleAssign}
              >
                Confirm Pair
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cohorts View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mentor Selection / Switcher */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Faculty Mentors</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1.5">
              {mentors.map((mentor) => {
                const count = mentees.filter(m => m.mentor_id === mentor.id).length;
                const isSelected = mentor.id === selectedMentorId;

                return (
                  <button
                    key={mentor.id}
                    onClick={() => setSelectedMentorId(mentor.id)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition ${
                      isSelected
                        ? 'bg-violet-600/20 border border-violet-500/40 text-[#F5F3FA]'
                        : 'bg-[#12101A] border border-[#30263E] text-[#AAA2B8] hover:text-[#F5F3FA] hover:bg-[#211A2D]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ProfileAvatar name={mentor.full_name} size="sm" />
                      <div>
                        <div className="text-xs font-semibold text-[#F5F3FA]">{mentor.full_name}</div>
                        <div className="text-[10px] text-[#777084]">{mentor.department}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-full">
                      {count} Mentees
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Unassigned Mentees Queue */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm">Unassigned Students</CardTitle>
                <span className="text-xs text-amber-400 font-bold">{unassignedMentees.length}</span>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {unassignedMentees.length === 0 ? (
                <p className="text-xs text-[#777084] py-2 text-center">All enrolled students are paired with mentors.</p>
              ) : (
                unassignedMentees.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-[#12101A] border border-[#30263E] flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-medium text-[#F5F3FA]">{m.full_name}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-[11px] py-1 px-2"
                      onClick={() => handleQuickReassign(m.id, selectedMentorId)}
                    >
                      Assign to Active
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Mentor Cohort Detail */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Cohort of {activeMentor?.full_name || 'Selected Mentor'}
                </CardTitle>
                <p className="text-xs text-[#AAA2B8] mt-0.5">
                  {activeMentorCohort.length} students officially supervised
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {activeMentorCohort.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#777084]">
                  No mentees currently assigned to this mentor.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#30263E]/60 bg-[#12101A]/30 text-[#AAA2B8] uppercase tracking-wider font-semibold text-[10px]">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">College Email</th>
                        <th className="py-3 px-4">Semester</th>
                        <th className="py-3 px-4 text-right">Reassign</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30263E]/40">
                      {activeMentorCohort.map((mentee) => (
                        <tr key={mentee.id} className="hover:bg-[#211A2D]/50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#F5F3FA]">
                            <div className="flex items-center gap-2">
                              <ProfileAvatar name={mentee.full_name} size="sm" />
                              <span>{mentee.full_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#AAA2B8]">{mentee.email}</td>
                          <td className="py-3 px-4 text-[#AAA2B8]">Semester {mentee.semester || 5}</td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="danger"
                              className="text-[11px] py-1 px-2.5"
                              onClick={() => handleQuickReassign(mentee.id, null)}
                            >
                              Unassign
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};
