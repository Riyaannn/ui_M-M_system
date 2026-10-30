import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminService, AdminDashboardStats } from '../../services/adminService';
import { dbStore } from '../../services/dbStore';
import { AuditLog, UserProfile, UserRole } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RoleBadge } from '../../components/ui/Badge';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  FileCheck2, 
  ShieldAlert, 
  Activity, 
  ArrowRight,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'mentor' | 'mentee'>('all');

  useEffect(() => {
    async function loadData() {
      const s = await adminService.getDashboardStats();
      const logs = await adminService.getAuditLogs();
      const p = await dbStore.getProfiles();
      setStats(s);
      setAuditLogs(logs.slice(0, 6));
      setAllProfiles(p);
    }
    loadData();
  }, []);

  const todayDateString = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Filtered users for the user management table
  const filteredProfiles = useMemo(() => {
    return allProfiles.filter((p) => {
      if (p.role === 'admin') return false; // Show students and faculty in user directory
      const matchesRole = roleFilter === 'all' || p.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.full_name.toLowerCase().includes(q) || 
        p.email.toLowerCase().includes(q) ||
        (p.department && p.department.toLowerCase().includes(q));
      return matchesRole && matchesSearch;
    });
  }, [allProfiles, searchQuery, roleFilter]);

  const mentorAnusha = allProfiles.find(p => p.role === 'mentor' && p.full_name === 'Anusha');
  const anushaMentees = allProfiles.filter(p => p.role === 'mentee' && p.mentor_id === mentorAnusha?.id);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Editorial Page Header */}
      <PageHeader
        title="Overview"
        subtitle="Your mentoring ecosystem, at a glance."
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>M&amp;M Administration Workspace &bull; {todayDateString}</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Link to="/admin/verifications">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Review Marks ({stats?.pendingVerifications || 0})
              </Button>
            </Link>
            <Link to="/admin/assignments">
              <Button variant="secondary" size="sm">
                Cohort Allocation
              </Button>
            </Link>
          </div>
        }
      />

      {/* Understated Welcome & Institutional Context Panel */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#191521] via-[#211A2D] to-[#191521] border border-[#30263E] shadow-card-dark relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/15 px-2 py-0.5 rounded-full border border-violet-500/30">
            NMAMIT, Nitte
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F3FA] mt-2">
            Institutional Oversight &amp; Governance
          </h2>
          <p className="text-xs sm:text-sm text-[#AAA2B8] mt-1.5 leading-relaxed">
            Supervise mentoring cohorts, audit verified academic milestones, manage student contact visibility, and preserve compliance across engineering departments.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient from-violet-600/10 to-transparent pointer-events-none" />
      </div>

      {/* Section 1: Core Institutional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mentees"
          value={stats?.totalMentees ?? 6}
          subtitle="Assigned to Mentor Anusha"
          icon={<Users className="w-5 h-5" />}
          color="violet"
        />
        <StatCard
          title="Active Mentors"
          value={stats?.totalMentors ?? 1}
          subtitle="Faculty Mentor Anusha"
          icon={<GraduationCap className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Pending Verification"
          value={stats?.pendingVerifications ?? 0}
          subtitle="Examination marks awaiting audit"
          icon={<FileCheck2 className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Active Accounts"
          value={stats?.activeUsers ?? 7}
          subtitle="Non-deactivated users"
          icon={<ShieldCheck className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Section 2: Large User-Management Directory + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: User Directory */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>User Directory</CardTitle>
                <p className="text-xs text-[#AAA2B8] mt-0.5">
                  Filter and inspect enrolled faculty mentors and student mentees
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl bg-[#12101A] p-0.5 border border-[#30263E]">
                  {(['all', 'mentor', 'mentee'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition capitalize ${
                        roleFilter === r
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'text-[#AAA2B8] hover:text-[#F5F3FA]'
                      }`}
                    >
                      {r === 'all' ? 'All Roles' : `${r}s`}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <div className="p-4 border-b border-[#30263E]/60 bg-[#12101A]/40 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#777084] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by student or faculty name, email, department..."
                  className="w-full pl-9 pr-3.5 py-2 bg-[#12101A] border border-[#30263E] rounded-xl text-xs text-[#F5F3FA] placeholder-[#777084] focus:outline-none focus:border-violet-500"
                />
              </div>
              <span className="text-[11px] text-[#777084] hidden sm:inline flex-shrink-0">
                {filteredProfiles.length} records
              </span>
            </div>

            <CardContent className="p-0">
              {filteredProfiles.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#AAA2B8]">
                  No matching user accounts found for "{searchQuery}".
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#30263E]/60 bg-[#12101A]/30 text-[#AAA2B8] uppercase tracking-wider font-semibold text-[10px]">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Department / Semester</th>
                        <th className="py-3 px-4">Mentor Assignment</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30263E]/40">
                      {filteredProfiles.map((user) => (
                        <tr key={user.id} className="hover:bg-[#211A2D]/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <ProfileAvatar name={user.full_name} size="sm" />
                              <div>
                                <span className="font-semibold text-[#F5F3FA] block">
                                  {user.full_name}
                                </span>
                                <span className="text-[10px] text-[#777084]">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <RoleBadge role={user.role} />
                          </td>
                          <td className="py-3 px-4 text-[#AAA2B8]">
                            <div>
                              <span>{user.department || 'NMAMIT'}</span>
                              {user.semester && (
                                <span className="block text-[10px] text-[#777084]">
                                  Semester {user.semester}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {user.role === 'mentee' ? (
                              user.mentor ? (
                                <span className="inline-flex items-center gap-1.5 text-xs text-indigo-300">
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  {user.mentor.full_name}
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#777084] italic">Unassigned</span>
                              )
                            ) : (
                              <span className="text-[11px] text-[#777084]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {user.role === 'mentee' ? (
                              <Link to={`/admin/mentees/${user.id}`}>
                                <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                                  Profile
                                </Button>
                              </Link>
                            ) : (
                              <Link to="/admin/mentors">
                                <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                                  Manage
                                </Button>
                              </Link>
                            )}
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

        {/* Right Col: Recent Activity & Audit Trail */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-400" />
                <CardTitle className="text-base">Audit Trail</CardTitle>
              </div>
              <Link to="/admin/audit-logs">
                <Button size="sm" variant="ghost" className="text-xs py-1 px-2">
                  Full Log
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditLogs.length === 0 ? (
                <EmptyState
                  icon={<Activity className="w-5 h-5 text-[#AAA2B8]" />}
                  title="No Audit Logs"
                  description="System actions will be recorded here securely."
                />
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-[#30263E] bg-[#12101A]/60 text-xs space-y-1.5 hover:border-violet-500/30 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-violet-300 uppercase tracking-wider text-[10px] bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-[#777084] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[#AAA2B8] text-[11px] leading-relaxed">
                      {log.details?.message || `Target: ${log.target_type} (${log.target_id?.slice(0, 8) || ''}...)`}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 3: Mentor Assignment Overview & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Mentor Anusha Cohort Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <ProfileAvatar name={mentorAnusha?.full_name || 'Anusha'} size="sm" />
              <div>
                <CardTitle className="text-base">Mentor Anusha's Cohort</CardTitle>
                <p className="text-xs text-[#AAA2B8]">Computer Science &amp; Engineering Department</p>
              </div>
            </div>
            <Link to="/admin/assignments">
              <Button size="sm" variant="outline" className="text-xs">
                Manage Cohort
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-[#AAA2B8] leading-relaxed">
              Assigned <strong className="text-[#F5F3FA]">{anushaMentees.length} mentees</strong> from the 2025–2026 undergraduate batch:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {anushaMentees.map((mentee) => (
                <Link
                  key={mentee.id}
                  to={`/admin/mentees/${mentee.id}`}
                  className="p-2.5 rounded-xl bg-[#12101A] border border-[#30263E] hover:border-violet-500/40 transition group block"
                >
                  <p className="text-xs font-semibold text-[#F5F3FA] group-hover:text-violet-300 truncate">
                    {mentee.full_name}
                  </p>
                  <span className="text-[10px] text-[#777084]">Semester {mentee.semester || '5'}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Operations Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Administrative Actions</CardTitle>
            <p className="text-xs text-[#AAA2B8]">Essential institution operations</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/admin/verifications"
              className="p-3.5 rounded-xl bg-[#12101A] border border-[#30263E] hover:border-violet-500/40 hover:bg-[#211A2D] transition block group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                <ArrowRight className="w-3.5 h-3.5 text-[#777084] group-hover:text-violet-300 transform group-hover:translate-x-0.5 transition" />
              </div>
              <h4 className="text-xs font-bold text-[#F5F3FA] group-hover:text-violet-200">
                Marks Audit Console
              </h4>
              <p className="text-[11px] text-[#777084] mt-1">
                Verify draft semester CIE/SEE scores submitted by students.
              </p>
            </Link>

            <Link
              to="/admin/permissions"
              className="p-3.5 rounded-xl bg-[#12101A] border border-[#30263E] hover:border-violet-500/40 hover:bg-[#211A2D] transition block group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <ShieldAlert className="w-4 h-4 text-violet-400" />
                <ArrowRight className="w-3.5 h-3.5 text-[#777084] group-hover:text-violet-300 transform group-hover:translate-x-0.5 transition" />
              </div>
              <h4 className="text-xs font-bold text-[#F5F3FA] group-hover:text-violet-200">
                Privacy Matrix
              </h4>
              <p className="text-[11px] text-[#777084] mt-1">
                Toggle profile edit permissions and mentor record visibility.
              </p>
            </Link>

            <Link
              to="/admin/mentees"
              className="p-3.5 rounded-xl bg-[#12101A] border border-[#30263E] hover:border-violet-500/40 hover:bg-[#211A2D] transition block group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <ArrowRight className="w-3.5 h-3.5 text-[#777084] group-hover:text-violet-300 transform group-hover:translate-x-0.5 transition" />
              </div>
              <h4 className="text-xs font-bold text-[#F5F3FA] group-hover:text-violet-200">
                Student Directory &amp; CSV
              </h4>
              <p className="text-[11px] text-[#777084] mt-1">
                Audit student contact details and export cohort CSV records.
              </p>
            </Link>

            <Link
              to="/admin/audit-logs"
              className="p-3.5 rounded-xl bg-[#12101A] border border-[#30263E] hover:border-violet-500/40 hover:bg-[#211A2D] transition block group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Activity className="w-4 h-4 text-indigo-400" />
                <ArrowRight className="w-3.5 h-3.5 text-[#777084] group-hover:text-violet-300 transform group-hover:translate-x-0.5 transition" />
              </div>
              <h4 className="text-xs font-bold text-[#F5F3FA] group-hover:text-violet-200">
                Security Audit Log
              </h4>
              <p className="text-[11px] text-[#777084] mt-1">
                Review immutable log of institutional changes and actions.
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
