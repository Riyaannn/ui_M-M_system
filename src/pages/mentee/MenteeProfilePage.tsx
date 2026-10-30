import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbStore } from '../../services/dbStore';
import { profileService } from '../../services/profileService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { AccessSettings } from '../../types';
import { UserCircle2, Save, ShieldAlert, CheckCircle2, Building, Mail, Phone, BookOpen, Lock } from 'lucide-react';

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
          usn: usn ? usn.trim() : null,
          semester: Number(semester),
        },
        profile.id
      );

      await refreshProfile();
      success('Your student profile was updated successfully');
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Student Profile"
        subtitle="View and maintain permitted demographic and academic details for NMAMIT, Nitte"
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <UserCircle2 className="w-3.5 h-3.5 text-violet-400" />
            <span>M&amp;M Student Account</span>
          </div>
        }
      />

      {/* Permission Lock Warning if restricted */}
      {!canEdit && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
          <Lock className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <span>
            Self-editing for your profile has been locked by the NMAMIT administration. Contact the Dean's Office for corrections.
          </span>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Read-Only Institutional Card */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <ProfileAvatar name={fullName || 'Student'} size="xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F5F3FA]">{fullName}</h3>
                <p className="text-xs text-violet-300 font-mono mt-0.5">
                  USN: {usn || 'Not yet recorded'}
                </p>
                <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Enrolled Mentee
                </span>
              </div>

              <div className="pt-4 border-t border-[#30263E]/60 text-left space-y-2 text-xs">
                <div>
                  <span className="text-[#777084] text-[10px] uppercase font-bold tracking-wider block">
                    Institution
                  </span>
                  <span className="text-[#AAA2B8] block">NMAMIT, Nitte (Autonomous)</span>
                </div>
                <div>
                  <span className="text-[#777084] text-[10px] uppercase font-bold tracking-wider block">
                    Department
                  </span>
                  <span className="text-[#AAA2B8] block">{department}</span>
                </div>
                <div>
                  <span className="text-[#777084] text-[10px] uppercase font-bold tracking-wider block">
                    Academic Semester
                  </span>
                  <span className="text-[#AAA2B8] block">Semester {semester}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Editable Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Demographic &amp; Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      disabled={!canEdit || isSaving}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                      College USN
                    </label>
                    <input
                      type="text"
                      value={usn}
                      disabled={!canEdit || isSaving}
                      onChange={(e) => setUsn(e.target.value.toUpperCase())}
                      placeholder="e.g. 4NM22CS001"
                      className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] uppercase focus:outline-none focus:border-violet-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                      College Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-3.5 py-2.5 bg-[#100D17] border border-[#30263E] rounded-xl text-sm text-[#777084] cursor-not-allowed"
                    />
                    <p className="text-[10px] text-[#777084] mt-1">
                      Institutional email is managed by college administration.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                      Personal Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      disabled={!canEdit || isSaving}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter verified mobile number"
                      className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      disabled
                      className="w-full px-3.5 py-2.5 bg-[#100D17] border border-[#30263E] rounded-xl text-sm text-[#777084] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                      Semester
                    </label>
                    <select
                      value={semester}
                      disabled={!canEdit || isSaving}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500 disabled:opacity-50"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s.toString()}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {canEdit && (
                  <div className="pt-4 border-t border-[#30263E]/60 flex items-center justify-end">
                    <Button
                      type="submit"
                      variant="primary"
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

      </div>
    </div>
  );
};
