import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
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
      await profileService.assignMentee(
        menteeId,
        newMentorId,
        currentAdmin?.id || 'admin'
      );
      success('Mentor assignment updated');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to reassign');
    }
  };

  const currentMentor = mentors.find(m => m.id === selectedMentorId);
  const menteesAssignedToCurrentMentor = mentees.filter(m => m.mentor_id === selectedMentorId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-nmam-navy-800" />
          Mentor–Mentee Pairings & Assignment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Supervise and reallocate student supervision quotas across NMAMIT faculty
        </p>
      </div>

      {/* Assignment Control Box */}
      <Card className="bg-gradient-to-br from-slate-50 to-white border-nmam-teal-200">
        <CardHeader>
          <CardTitle className="text-sm">Quick Assignment Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                1. Select Mentee
              </label>
              <select
                value={selectedMenteeId}
                onChange={(e) => setSelectedMenteeId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none bg-white"
              >
                <option value="">-- Choose Student --</option>
                {mentees.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.usn || m.email}) &bull; Current: {m.mentor?.full_name || 'Unassigned'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                2. Target Faculty Mentor
              </label>
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none bg-white"
              >
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Button
                variant="teal"
                size="md"
                className="w-full text-xs font-semibold"
                onClick={handleAssign}
                disabled={!selectedMenteeId}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Assign Mentee
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentor Specific Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mentor Selector List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Faculty Mentors</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {mentors.map((m) => {
                const count = mentees.filter((s) => s.mentor_id === m.id).length;
                const isSelected = m.id === selectedMentorId;

                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMentorId(m.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left text-xs transition ${
                      isSelected
                        ? 'bg-nmam-navy-900 text-white shadow-sm'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm">{m.full_name}</div>
                      <div className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {m.department}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        isSelected
                          ? 'bg-nmam-teal-500 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {count} Mentees
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Assigned Mentees to Selected Mentor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-sm">
                  Mentees Under {currentMentor?.full_name} ({menteesAssignedToCurrentMentor.length})
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  NMAMIT Computer Science & Engineering department roster
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">USN / Email</th>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4 text-right">Reassign</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {menteesAssignedToCurrentMentor.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No mentees currently assigned to this mentor.
                        </td>
                      </tr>
                    ) : (
                      menteesAssignedToCurrentMentor.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {m.full_name}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {m.usn || m.email}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            Semester {m.semester || 5}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <select
                              onChange={(e) => handleQuickReassign(m.id, e.target.value || null)}
                              value={m.mentor_id || ''}
                              className="px-2 py-1 text-[11px] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-nmam-teal-500 bg-white"
                            >
                              <option value="">Unassign</option>
                              {mentors.map((otherMentor) => (
                                <option key={otherMentor.id} value={otherMentor.id}>
                                  Transfer to {otherMentor.full_name}
                                </option>
                              ))}
                            </select>
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
      </div>
    </div>
  );
};
