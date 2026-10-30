import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbStore } from '../../services/dbStore';
import { academicService } from '../../services/academicService';
import { recommendationService } from '../../services/recommendationService';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, VerificationBadge, ResultBadge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { EmptyState } from '../../components/ui/EmptyState';
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
  AlertCircle,
  MessageSquare,
  FileText
} from 'lucide-react';

export const MenteeDashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const { success } = useToast();
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (!profile) return;
    const acad = dbStore.getAcademicRecords(profile.id);
    setRecords(acad);

    const recs = dbStore.getRecommendations({ menteeId: profile.id });
    setRecommendations(recs);
  }, [profile]);

  const handleMarkAsRead = async (recId: string) => {
    if (!profile) return;
    try {
      await recommendationService.markAsViewed(recId, profile.id);
      success('Marked recommendation as read');
      const updated = dbStore.getRecommendations({ menteeId: profile.id });
      setRecommendations(updated);
    } catch (err: any) {
      // silently handle
    }
  };

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
  const latestRec = recommendations.length > 0 ? recommendations[0] : null;
  const olderRecs = recommendations.slice(1);

  const whatsappUrl = mentor?.phone
    ? `https://wa.me/${mentor.phone.replace(/[^0-9]/g, '')}`
    : null;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Editorial Page Header */}
      <PageHeader
        title="Your journey"
        subtitle="Everything you need to stay on track, in one place."
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Welcome, {profile?.full_name || 'Student'}</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Link to="/mentee/academic-records">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Submit Exam Draft
              </Button>
            </Link>
            <Link to="/mentee/recommendations">
              <Button variant="secondary" size="sm">
                Study Notes ({unreadRecs.length} new)
              </Button>
            </Link>
          </div>
        }
      />

      {/* Understated Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#191521] via-[#211A2D] to-[#191521] border border-[#30263E] shadow-card-dark relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4ADEA8] bg-[#4ADEA8]/15 px-2 py-0.5 rounded-full border border-[#4ADEA8]/30">
            Student Mentoring Space &bull; Semester {profile?.semester || 5}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F3FA] mt-2">
            Welcome back, {profile?.full_name}
          </h2>
          <p className="text-xs sm:text-sm text-[#AAA2B8] mt-1.5 leading-relaxed">
            {profile?.department || 'Computer Science & Engineering'} &bull; NMAMIT, Nitte. Access verified academic milestones, study resources curated by Mentor {mentor?.full_name || 'Anusha'}, and submit examination drafts.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient from-violet-600/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Mentor"
          value={mentor ? mentor.full_name : 'Anusha'}
          subtitle={mentor?.department || 'Faculty Mentor'}
          icon={<GraduationCap className="w-5 h-5" />}
          color="violet"
        />
        <StatCard
          title="Profile Status"
          value={`${profileCompletionPct}%`}
          subtitle={profileCompletionPct === 100 ? 'Verified profile' : 'Add phone / USN'}
          icon={<UserCircle2 className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Active Semester"
          value={`Semester ${profile?.semester || 5}`}
          subtitle="Undergraduate Degree"
          icon={<Award className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Study Notes"
          value={recommendations.length}
          subtitle={`${unreadRecs.length} unread materials`}
          icon={<BookMarked className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Profile Completion Warning if needed */}
      {profileCompletionPct < 100 && (
        <div className="p-4 rounded-2xl bg-[#191521] border border-amber-500/30 flex items-start justify-between gap-4 text-xs shadow-card-dark">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex-shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#F5F3FA]">Profile Setup in Progress ({profileCompletionPct}%)</div>
              <p className="text-[#AAA2B8] text-xs mt-0.5 leading-relaxed">
                Add your official student USN and verified contact details to ensure faculty mentor communications reach you seamlessly.
              </p>
            </div>
          </div>
          <Link to="/mentee/profile">
            <Button size="sm" variant="secondary" className="flex-shrink-0">
              Update Profile
            </Button>
          </Link>
        </div>
      )}

      {/* Main Grid: Featured Recommendation & Mentor Contact Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Featured Recommendation & Resource Feed */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Distinct Featured Recommendation Card */}
          {latestRec ? (
            <Card className="border-violet-500/40 bg-gradient-to-br from-[#191521] to-[#211A2D] shadow-glow-violet-sm">
              <CardHeader className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-md">
                    Featured &bull; {latestRec.subject}
                  </span>
                  <span className="text-[11px] text-[#AAA2B8]">From Mentor {mentor?.full_name || 'Anusha'}</span>
                </div>
                {latestRec.is_viewed ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4ADEA8] bg-[#4ADEA8]/10 border border-[#4ADEA8]/30 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Read
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FBBF74] bg-[#FBBF74]/10 border border-[#FBBF74]/30 px-2.5 py-0.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" /> New Material
                  </span>
                )}
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <h3 className="text-base sm:text-lg font-bold text-[#F5F3FA]">
                  {latestRec.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#AAA2B8] leading-relaxed">
                  {latestRec.description}
                </p>

                <div className="pt-3 border-t border-[#30263E]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#777084] text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Assigned on {new Date(latestRec.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {latestRec.resource_url && (
                      <a
                        href={latestRec.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-xs transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Resource
                      </a>
                    )}
                    {!latestRec.is_viewed && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMarkAsRead(latestRec.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-[#777084] text-xs">
                No study materials assigned yet by your mentor.
              </CardContent>
            </Card>
          )}

          {/* Older Recommendations List */}
          {olderRecs.length > 0 && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Previous Study Resources</CardTitle>
                  <p className="text-xs text-[#AAA2B8]">Earlier recommendations shared by your mentor</p>
                </div>
                <Link to="/mentee/recommendations">
                  <Button size="sm" variant="ghost" className="text-xs">
                    View All ({recommendations.length})
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {olderRecs.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl border border-[#30263E] bg-[#12101A]/60 flex items-center justify-between gap-3 hover:border-violet-500/40 transition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-violet-300 bg-violet-500/15 px-2 py-0.5 rounded border border-violet-500/30">
                          {rec.subject}
                        </span>
                        <h4 className="text-xs font-semibold text-[#F5F3FA] truncate">{rec.title}</h4>
                      </div>
                      <p className="text-[11px] text-[#777084] truncate mt-1">{rec.description}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {rec.is_viewed ? (
                        <span className="text-[10px] text-[#4ADEA8] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Read
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkAsRead(rec.id)}
                          className="text-[10px] text-amber-400 hover:underline font-semibold"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Academic Records Table */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Academic Results &amp; Verified Marks</CardTitle>
                <p className="text-xs text-[#AAA2B8]">Subject-wise performance across active semester</p>
              </div>
              <Link to="/mentee/academic-records">
                <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Submit Draft
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#30263E]/60 bg-[#12101A]/30 text-[#AAA2B8] uppercase tracking-wider font-semibold text-[10px]">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Credits</th>
                      <th className="py-3 px-4">Total Marks</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4">Result</th>
                      <th className="py-3 px-4">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30263E]/40">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#777084]">
                          No academic records registered yet. Click above to submit exam draft scores.
                        </td>
                      </tr>
                    ) : (
                      records.slice(0, 4).map((r) => (
                        <tr key={r.id} className="hover:bg-[#211A2D]/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-[#F5F3FA] block">{r.subject_name}</span>
                            <span className="text-[10px] font-mono text-violet-300">{r.subject_code}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#AAA2B8]">{r.credits} cr</td>
                          <td className="py-3 px-4 font-mono font-bold text-[#F5F3FA]">
                            {r.total_marks ?? '-'} / {r.maximum_marks}
                          </td>
                          <td className="py-3 px-4 font-bold text-violet-300">
                            {r.grade || '-'}
                          </td>
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

        {/* Right Col: Mentor Information Card */}
        <div className="space-y-6">
          <Card className="border-violet-500/30">
            <CardHeader className="bg-[#12101A]/60 pb-3 border-b border-[#30263E]/60">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-violet-400" />
                <CardTitle className="text-sm">Assigned Faculty Mentor</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <ProfileAvatar name={mentor?.full_name || 'Anusha'} size="md" />
                <div>
                  <h4 className="font-bold text-base text-[#F5F3FA]">
                    {mentor?.full_name || 'Anusha'}
                  </h4>
                  <p className="text-xs text-[#AAA2B8]">
                    {mentor?.department || 'Computer Science & Engineering'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#30263E]/60 text-xs">
                <div>
                  <span className="text-[#777084] text-[10px] uppercase font-bold tracking-wider block">
                    Institutional Email
                  </span>
                  <a
                    href={`mailto:${mentor?.email || 'anusha.mentor@nmamit.nitte.edu'}`}
                    className="text-violet-300 underline font-medium mt-0.5 block truncate"
                  >
                    {mentor?.email || 'anusha.mentor@nmamit.nitte.edu'}
                  </a>
                </div>

                <div>
                  <span className="text-[#777084] text-[10px] uppercase font-bold tracking-wider block">
                    Telephone Contact
                  </span>
                  {mentor?.phone ? (
                    <a href={`tel:${mentor.phone}`} className="text-[#F5F3FA] font-medium mt-0.5 block hover:text-violet-300">
                      {mentor.phone}
                    </a>
                  ) : (
                    <span className="text-[#777084] italic mt-0.5 block">Official office hours contact</span>
                  )}
                </div>

                <div>
                  <span className="text-[#777084] text-[10px] uppercase font-bold tracking-wider block">
                    College Affiliation
                  </span>
                  <span className="text-[#AAA2B8] mt-0.5 block">
                    NMAM Institute of Technology, Nitte
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#30263E]/60 flex flex-col gap-2">
                <a
                  href={`mailto:${mentor?.email || 'anusha.mentor@nmamit.nitte.edu'}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 transition font-semibold"
                >
                  <Mail className="w-4 h-4" /> Email Mentor
                </a>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#4ADEA8]/15 text-[#4ADEA8] border border-[#4ADEA8]/30 hover:bg-[#4ADEA8]/25 transition font-semibold"
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};
