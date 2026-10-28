import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dbStore } from '../../services/dbStore';
import { recommendationService } from '../../services/recommendationService';
import { academicService } from '../../services/academicService';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, VerificationBadge } from '../../components/ui/Badge';
import { UserProfile, Recommendation, AcademicRecord } from '../../types';
import { 
  Users, 
  BookMarked, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Plus, 
  Mail, 
  Phone, 
  GraduationCap, 
  Sparkles,
  Award
} from 'lucide-react';

export const MentorDashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [assignedMentees, setAssignedMentees] = useState<UserProfile[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [pendingRecords, setPendingRecords] = useState<AcademicRecord[]>([]);

  useEffect(() => {
    if (!profile) return;
    const mentees = dbStore.getMenteesByMentorId(profile.id);
    setAssignedMentees(mentees);

    const recs = dbStore.getRecommendations({ mentorId: profile.id });
    setRecommendations(recs);

    // Records for assigned mentees pending verification
    const allRecords = dbStore.getAcademicRecords();
    const assignedIds = new Set(mentees.map(m => m.id));
    const pending = allRecords.filter(r => assignedIds.has(r.mentee_id) && r.verification_status === 'pending');
    setPendingRecords(pending);
  }, [profile]);

  const viewedRecsCount = recommendations.filter(r => r.is_viewed).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-nmam-navy-900 via-nmam-navy-800 to-nmam-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-3 border border-sky-500/30">
            <GraduationCap className="w-3.5 h-3.5" /> Faculty Mentoring Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome, {profile?.full_name || 'Mentor'}
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Supervise your 6 assigned mentees from NMAMIT Computer Science & Engineering. Recommend targeted learning materials, monitor semester progress, and keep private observations.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/mentor/recommendations">
              <Button variant="teal" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Recommend Study Material
              </Button>
            </Link>
            <Link to="/mentor/mentees">
              <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                View Assigned Mentees ({assignedMentees.length})
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-400 via-white to-transparent pointer-events-none" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Mentees"
          value={assignedMentees.length}
          subtitle="Riya Ann, Riya Pai, Rohan, etc."
          icon={<Users className="w-5 h-5" />}
          color="navy"
        />
        <StatCard
          title="Recommendations Given"
          value={recommendations.length}
          subtitle={`${viewedRecsCount} marked as read`}
          icon={<BookMarked className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Marks Pending Audit"
          value={pendingRecords.length}
          subtitle="Draft marks submitted by mentees"
          icon={<Award className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Active Semester"
          value="Sem 5"
          subtitle="B.Tech Computer Science & Engg"
          icon={<GraduationCap className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Main Grid: Mentee Directory & Recent Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assigned Mentees Directory */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>My Assigned Mentees</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Initial demonstration records assigned to Mentor Anusha
                </p>
              </div>
              <Link to="/mentor/mentees">
                <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4">Contact Links</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignedMentees.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No mentees currently assigned to your account.
                        </td>
                      </tr>
                    ) : (
                      assignedMentees.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{m.full_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{m.usn || m.email}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            Semester {m.semester || 5}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <a
                                href={`mailto:${m.email}`}
                                className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-nmam-navy-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition"
                                title={`Send email to ${m.email}`}
                              >
                                <Mail className="w-3 h-3 text-slate-500" /> Email
                              </a>
                              {m.phone ? (
                                <a
                                  href={`tel:${m.phone}`}
                                  className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition"
                                  title={`Call ${m.phone}`}
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" /> Call
                                </a>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No phone yet</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link to={`/mentor/mentees/${m.id}`}>
                              <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                                Academic Dossier
                              </Button>
                            </Link>
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

        {/* Right Col: Recent Study Recommendations Given */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-sm">Recent Recommendations</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Study materials you assigned</p>
              </div>
              <Link to="/mentor/recommendations">
                <Button size="sm" variant="ghost" className="text-xs">
                  All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center">
                  No recommendations created yet. Click above to recommend materials.
                </div>
              ) : (
                recommendations.slice(0, 4).map((rec) => (
                  <div key={rec.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 truncate max-w-[160px]">
                        {rec.title}
                      </span>
                      {rec.is_viewed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Read
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                          <Clock className="w-3 h-3" /> Unread
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[11px] line-clamp-2">
                      {rec.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Mentee: {rec.mentee?.full_name || 'Assigned Student'}</span>
                      <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                    </div>
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
