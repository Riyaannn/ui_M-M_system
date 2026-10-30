import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { dbStore } from '../../services/dbStore';
import { adminService } from '../../services/adminService';
import { UserProfile, AccessSettings } from '../../types';
import { ShieldAlert, ShieldCheck, Lock, Unlock, Eye, EyeOff, UserCheck } from 'lucide-react';

export const AdminPermissionsPage: React.FC = () => {
  const { profile: currentAdmin } = useAuth();
  const { success, error } = useToast();
  const [mentees, setMentees] = useState<UserProfile[]>([]);
  const [settingsMap, setSettingsMap] = useState<Record<string, AccessSettings>>({});

  const loadData = async () => {
    const list = dbStore.getAllMentees();
    setMentees(list);

    const map: Record<string, AccessSettings> = {};
    for (const m of list) {
      const s = await adminService.getAccessSettings(m.id);
      map[m.id] = s;
    }
    setSettingsMap(map);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (menteeId: string, field: keyof AccessSettings) => {
    const current = settingsMap[menteeId];
    if (!current) return;
    const currentVal = current[field] as boolean;

    try {
      const updated = await adminService.updateAccessSettings(
        menteeId,
        { [field]: !currentVal },
        currentAdmin?.id || 'admin'
      );
      setSettingsMap((prev) => ({
        ...prev,
        [menteeId]: updated,
      }));
      success(`Updated ${field} permission for student`);
    } catch (err: any) {
      error(err.message || 'Failed to update access setting');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Privacy & Access Control Matrix"
        subtitle="Manage student self-editing rights, mentor academic view rights, and contact disclosure"
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <ShieldAlert className="w-3.5 h-3.5 text-violet-400" />
            <span>Institutional Governance Matrix</span>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Per-Student Access Rights</CardTitle>
            <p className="text-xs text-[#AAA2B8] mt-0.5">
              Administrators hold sovereign authority to restrict or enable field-level student and mentor access.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#30263E]/60 bg-[#12101A]/30 text-[#AAA2B8] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Student Mentee</th>
                  <th className="py-3 px-4">Assigned Mentor</th>
                  <th className="py-3 px-4 text-center">Student Profile Self-Edit</th>
                  <th className="py-3 px-4 text-center">Mentor Academic View</th>
                  <th className="py-3 px-4 text-center">Contact Details View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30263E]/40">
                {mentees.map((mentee) => {
                  const s = settingsMap[mentee.id];

                  return (
                    <tr key={mentee.id} className="hover:bg-[#211A2D]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <ProfileAvatar name={mentee.full_name} size="sm" />
                          <div>
                            <span className="font-semibold text-[#F5F3FA] block">{mentee.full_name}</span>
                            <span className="text-[10px] text-[#777084]">{mentee.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#AAA2B8]">
                        {mentee.mentor?.full_name || (
                          <span className="text-[#777084] italic">Unassigned</span>
                        )}
                      </td>

                      {/* Allow Profile Edit Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          size="sm"
                          variant={s?.allow_profile_edit ? 'primary' : 'secondary'}
                          className={`text-xs py-1 px-3 ${
                            s?.allow_profile_edit
                              ? ''
                              : 'text-[#777084]'
                          }`}
                          onClick={() => handleToggle(mentee.id, 'allow_profile_edit')}
                        >
                          {s?.allow_profile_edit ? (
                            <span className="flex items-center gap-1.5">
                              <Unlock className="w-3.5 h-3.5" /> Allowed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5" /> Locked
                            </span>
                          )}
                        </Button>
                      </td>

                      {/* Allow Academic View Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          size="sm"
                          variant={s?.allow_academic_view ? 'primary' : 'secondary'}
                          className={`text-xs py-1 px-3 ${
                            s?.allow_academic_view
                              ? ''
                              : 'text-[#777084]'
                          }`}
                          onClick={() => handleToggle(mentee.id, 'allow_academic_view')}
                        >
                          {s?.allow_academic_view ? (
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" /> Visible
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <EyeOff className="w-3.5 h-3.5" /> Hidden
                            </span>
                          )}
                        </Button>
                      </td>

                      {/* Allow Contact View Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          size="sm"
                          variant={s?.allow_contact_view ? 'primary' : 'secondary'}
                          className={`text-xs py-1 px-3 ${
                            s?.allow_contact_view
                              ? ''
                              : 'text-[#777084]'
                          }`}
                          onClick={() => handleToggle(mentee.id, 'allow_contact_view')}
                        >
                          {s?.allow_contact_view ? (
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" /> Disclosed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <EyeOff className="w-3.5 h-3.5" /> Restricted
                            </span>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
