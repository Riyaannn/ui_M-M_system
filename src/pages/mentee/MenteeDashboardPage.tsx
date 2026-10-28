import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dbStore } from '../../services/dbStore';
import { academicService } from '../../services/academicService';
import { recommendationService } from '../../services/recommendationService';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, VerificationBadge, ResultBadge } from '../../components/ui/Badge';
import { AcademicRecord, Recommendation, SemesterSummary } from '../../types';
import { 
  GraduationCap, 
  Award, 
  BookMarked, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Mail, 
  Phone, 
  UserCircle2, 
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const MenteeDashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (!profile) return;
    const acad = dbStore.getAcademicRecords(profile.id);
    setRecords(acad);

    const recs = dbStore.getRecommendations({ menteeId: profile.id });
    setRecommendations(recs);
  }, [profile]);

  // Profile completion calculation
  const profileFields = [
    profile?.full_name,
    profile?.email,
    profile?.phone,
    profile?.usn,
    profile?.semester,
    profile?.department,
    profile?.branch,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletionPct = Math.round((completedFields / profileFields.length) * 100);

  const summaries = academicService.calculateSummaries(records);
  const unreadRecs = recommendations.filter(r => !r.is_viewed);
  const mentor = profile?.mentor;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-nmam-navy-900 via-nmam-navy-800 to-nmam-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Mentee Academic Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {profile?.full_name}
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            NMAM Institute of Technology, Nitte &bull; {profile?.department || 'Computer Science & Engineering'} (Semester {profile?.semester || 5})
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/mentee/recommendations">
              <Button variant="teal" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Recommended Study Notes ({unreadRecs.length} new)
              </Button>
            </Link>
            <Link to="/mentee/academic-records">
              <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                View Examination Results
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-white to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Mentor"
          value={mentor ? mentor.full_name : 'Pending'}
          subtitle={mentor ? mentor.email : 'No mentor assigned yet'}
          icon={<GraduationCap className="w-5 h-5" />}
          color="navy"
        />
        <StatCard
          title="Profile Completion"
          value={`${profileCompletionPct}%`}
          subtitle={profileCompletionPct === 100 ? 'Fully completed' : 'Add USN / contact info'}
          icon={<UserCircle2 className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Active Semester"
          value={`Sem ${profile?.semester || 5}`}
          subtitle="B.Tech Computer Science"
          icon={<Award className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Study Recommendations"
          value={recommendations.length}
          subtitle={`${unreadRecs.length} unread materials`}
          icon={<BookMarked className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Profile completion notice if needed */}
      {profileCompletionPct < 100 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-900">Complete Your Academic Profile</div>
              <p className="text-amber-800 mt-0.5">
                Your profile is {profileCompletionPct}% complete. Please add your official college USN and phone number so your mentor can contact you.
              </p>
            </div>
          </div>
          <Link to="/mentee/profile">
            <Button size="sm" variant="outline" className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100">
              Update Profile
            </Button>
          </Link>
        </div>
      )}

      {/* Main Grid: Mentor Card & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Study Notes from Mentor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recommended Study Notes & Learning Materials</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned by Mentor {mentor?.full_name || 'Anusha'}
                </p>
              </div>
              <Link to="/mentee/recommendations">
                <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View All ({recommendations.length})
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.length === 0 ? (
                <div className="text-xs text-slate-400 py-8 text-center">
                  No study materials recommended by your mentor yet.
                </div>
              ) : (
                recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-nmam-teal-700 bg-nmam-teal-50 px-2 py-0.5 rounded border border-nmam-teal-100">
                          {rec.subject}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">{rec.title}</h4>
                      </div>
                      {rec.is_viewed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Read
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200">
                          <Clock className="w-3 h-3" /> New
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600 leading-relaxed">{rec.description}</p>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px]">
                      {rec.resource_url && (
                        <a
                          href={rec.resource_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-nmam-navy-800 font-semibold hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open Resource Link
                        </a>
                      )}
                      <span className="text-slate-400">
                        Assigned on {new Date(rec.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Academic Records summary */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recent Examination Results</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Verified semester subjects</p>
              </div>
              <Link to="/mentee/academic-records">
                <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Full Dossier
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Credits</th>
                      <th className="py-3 px-4">Total Marks</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4">Result</th>
                      <th className="py-3 px-4">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No examination records registered yet.
                        </td>
                      </tr>
                    ) : (
                      records.slice(0, 4).map((r) => (
                        <tr key={r.id}>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {r.subject_name}
                            <span className="block text-[10px] text-slate-400 font-mono">{r.subject_code}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{r.credits}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {r.total_marks != null ? r.total_marks : '-'} / {r.maximum_marks}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">{r.grade || '-'}</td>
                          <td className="py-3 px-4">
                            <ResultBadge status={r.result_status} />
                          </td>
                          <td className="py-3 px-4">
                            <VerificationBadge status={r.verification_status} />
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

        {/* Right Col: Mentor Contact Card */}
        <div>
          <Card>
            <CardHeader className="bg-slate-50/50">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-nmam-teal-600" />
                <CardTitle className="text-sm">Assigned Faculty Mentor</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {mentor ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-nmam-navy-100 text-nmam-navy-800 flex items-center justify-center font-bold text-base">
                      {mentor.full_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{mentor.full_name}</h4>
                      <p className="text-slate-500 text-[11px]">{mentor.department}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Email:</span>
                      <a href={`mailto:${mentor.email}`} className="text-nmam-navy-700 font-semibold hover:underline">
                        {mentor.email}
                      </a>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Contact Phone:</span>
                      {mentor.phone ? (
                        <a href={`tel:${mentor.phone}`} className="text-slate-800 font-semibold hover:underline">
                          {mentor.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Faculty phone not published</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link to="/mentee/mentor">
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        View Mentor Details & Schedule
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <p>You have not yet been assigned a faculty mentor.</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    The administration office will assign you shortly.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
