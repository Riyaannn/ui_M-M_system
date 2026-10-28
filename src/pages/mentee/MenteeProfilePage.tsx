import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbStore } from '../../services/dbStore';
import { profileService } from '../../services/profileService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AccessSettings } from '../../types';
import { UserCircle2, Save, ShieldAlert, CheckCircle2, Building, Mail, Phone, BookOpen } from 'lucide-react';

export const MenteeProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const { success, error } = useToast();

  const [access, setAccess] = useState<AccessSettings | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [usn, setUsn] = useState('');
  const [department, setDepartment] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('5');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name || '');
    setEmail(profile.email || '');
    setPhone(profile.phone || '');
    setUsn(profile.usn || '');
    setDepartment(profile.department || 'Computer Science & Engineering');
    setBranch(profile.branch || 'B.Tech - CSE');
    setSemester(profile.semester ? profile.semester.toString() : '5');

    const acc = dbStore.getAccessSettings(profile.id);
    setAccess(acc);
  }, [profile]);

  const canEdit = access ? access.allow_profile_edit : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!canEdit) {
      error('Profile editing has been restricted by the administrator');
      return;
    }

    if (!fullName) {
      error('Full Name is required');
      return;
    }

    setIsSaving(true);
    try {
      await profileService.updateProfile(
        profile.id,
        {
          full_name: fullName,
          phone: phone ? phone.trim() : null,
          usn: usn ? usn.trim().toUpperCase() : null,
          semester: Number(semester) || 5,
          department,
          branch,
        },
        profile.id
      );

      await refreshProfile();
      success('Your academic profile has been updated successfully', 'Profile Saved');
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <UserCircle2 className="w-6 h-6 text-nmam-teal-600" />
          My Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          NMAM Institute of Technology, Nitte &bull; Student Demographic & Contact Records
        </p>
      </div>

      {!canEdit && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Administrative Lock Active:</span> The college administration has currently locked student self-editing for this academic cycle. To change registered details, please submit a written request to the Dean of Academics Office.
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Personal & Academic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Riya Ann"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  College USN (University Seat Number)
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  placeholder="e.g. 4NM22CS001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none uppercase disabled:bg-slate-100 disabled:text-slate-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Enter your official NMAMIT VTU/Autonomous USN.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  College Registered Email (Read-Only)
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  College email is managed directly by NMAMIT IT Services.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  disabled={!canEdit}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Used by your mentor for direct academic contact.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Branch / Degree
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Semester
                </label>
                <select
                  disabled={!canEdit}
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Faculty Mentor
                </label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800">
                  {profile?.mentor ? profile.mentor.full_name : 'No Mentor Assigned'}
                </div>
              </div>
            </div>

            {canEdit && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  variant="teal"
                  size="md"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Profile Changes
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
