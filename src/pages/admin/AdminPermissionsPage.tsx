import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-purple-600" />
          Access Control & Privacy Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Administer granular visibility and editing policies enforced by backend database rules
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Unlock className="w-4 h-4 text-emerald-600" />
            Profile Editing
          </div>
          <p className="text-slate-500 text-[11px]">
            When disabled, mentees cannot modify their USN, semester, or personal contact info.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-sky-600" />
            Academic Record Visibility
          </div>
          <p className="text-slate-500 text-[11px]">
            Controls whether the assigned faculty mentor is permitted to inspect semester examination marks.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-purple-600" />
            Contact Info Disclosure
          </div>
          <p className="text-slate-500 text-[11px]">
            Protects student phone numbers and direct contact links from unauthorized visibility.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mentee Privacy Configuration Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Assigned Mentor</th>
                  <th className="py-3 px-4 text-center">Allow Profile Edit</th>
                  <th className="py-3 px-4 text-center">Allow Academic View</th>
                  <th className="py-3 px-4 text-center">Allow Contact View</th>
                  <th className="py-3 px-4 text-right">Settings Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mentees.map((m) => {
                  const s = settingsMap[m.id];
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {m.full_name}
                        <span className="block text-[10px] text-slate-400 font-mono">{m.email}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {m.mentor?.full_name || (
                          <span className="text-amber-600 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggle(m.id, 'allow_profile_edit')}
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                            s?.allow_profile_edit
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {s?.allow_profile_edit ? 'Enabled' : 'Restricted'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggle(m.id, 'allow_academic_view')}
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                            s?.allow_academic_view
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {s?.allow_academic_view ? 'Visible' : 'Hidden'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggle(m.id, 'allow_contact_view')}
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                            s?.allow_contact_view
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {s?.allow_contact_view ? 'Visible' : 'Hidden'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="default" size="sm">Active Policy</Badge>
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
