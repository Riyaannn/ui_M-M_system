import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService, AdminDashboardStats } from '../../services/adminService';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RoleBadge } from '../../components/ui/Badge';
import { dbStore } from '../../services/dbStore';
import { AuditLog, UserProfile } from '../../types';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  FileCheck2, 
  ShieldAlert, 
  Activity, 
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [mentees, setMentees] = useState<UserProfile[]>([]);

  useEffect(() => {
    async function loadData() {
      const s = await adminService.getDashboardStats();
      const logs = await adminService.getAuditLogs();
      const m = await dbStore.getAllMentees();
      setStats(s);
      setAuditLogs(logs.slice(0, 6));
      setMentees(m);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-nmam-navy-900 via-nmam-navy-800 to-nmam-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-nmam-teal-500/20 text-nmam-teal-300 text-xs font-semibold mb-3 border border-nmam-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Administrator Central Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            NMAMIT Mentor–Mentee Management System
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Monitor institutional mentoring progress, supervise mentor assignments, verify student academic records, and govern granular privacy permissions for NMAMIT, Nitte.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/admin/verifications">
              <Button variant="teal" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Review Pending Marks ({stats?.pendingVerifications || 0})
              </Button>
            </Link>
            <Link to="/admin/assignments">
              <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Manage Mentor Assignments
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-nmam-teal-400 via-white to-transparent pointer-events-none" />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mentees"
          value={stats?.totalMentees ?? '...'}
          subtitle="6 Initial Mentees registered"
          icon={<Users className="w-5 h-5" />}
          color="navy"
        />
        <StatCard
          title="Active Mentors"
          value={stats?.totalMentors ?? '...'}
          subtitle="Mentor Anusha assigned"
          icon={<GraduationCap className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Pending Verification"
          value={stats?.pendingVerifications ?? 0}
          subtitle="Marks awaiting admin check"
          icon={<FileCheck2 className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Setup Needed"
          value={stats?.accountsAwaitingSetup ?? 0}
          subtitle="Pending USN or contact details"
          icon={<ShieldAlert className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Main Grid: Mentees Summary & Live Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Initial Demonstration Mentees Directory */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Initial Mentees Roster</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Demonstration mentees assigned to Mentor Anusha (NMAMIT CSE Department)
                </p>
              </div>
              <Link to="/admin/mentees">
                <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View All Mentees
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">College Email</th>
                      <th className="py-3 px-4">Assigned Mentor</th>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mentees.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {m.full_name}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {m.email}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-medium text-[11px] border border-sky-200">
                            <GraduationCap className="w-3 h-3" />
                            {m.mentor?.full_name || 'Unassigned'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          Semester {m.semester || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link to={`/admin/mentees/${m.id}`}>
                            <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                              View Profile
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Recent System Activity / Audit Trail */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-nmam-teal-600" />
                <CardTitle>System Audit Trail</CardTitle>
              </div>
              <Link to="/admin/audit-logs">
                <Button size="sm" variant="ghost" className="text-xs">
                  Full Log
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditLogs.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">No audit logs recorded yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      {log.details?.message || `Target: ${log.target_type} (${log.target_id || ''})`}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
