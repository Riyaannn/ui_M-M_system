import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dbStore } from '../../services/dbStore';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, VerificationBadge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { EmptyState } from '../../components/ui/EmptyState';
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
  Award,
  ExternalLink,
  StickyNote,
  ChevronRight
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
  const unreadRecsCount = recommendations.length - viewedRecsCount;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Editorial Page Header */}
      <PageHeader
        title="Your mentoring space"
        subtitle="Keep track of progress, share guidance, and help every mentee move forward."
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Welcome back, {profile?.full_name || 'Anusha'}</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Link to="/mentor/recommendations">
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                New Recommendation
              </Button>
            </Link>
            <Link to="/mentor/notes">
              <Button variant="secondary" size="sm" leftIcon={<StickyNote className="w-4 h-4" />}>
                Counseling Notes
              </Button>
            </Link>
          </div>
        }
      />

      {/* Understated Welcome & Cohort Context */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#191521] via-[#211A2D] to-[#191521] border border-[#30263E] shadow-card-dark relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-500/30">
            Faculty Mentoring &bull; CSE Department
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F3FA] mt-2">
            Supervising {assignedMentees.length} Undergraduate Mentees
          </h2>
          <p className="text-xs sm:text-sm text-[#AAA2B8] mt-1.5 leading-relaxed">
            Monitor academic trajectories, track which study resources your mentees have accessed, and provide timely academic interventions before semester examinations.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient from-indigo-600/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Mentees"
          value={assignedMentees.length}
          subtitle="6 enrolled undergraduates"
          icon={<Users className="w-5 h-5" />}
          color="violet"
        />
        <StatCard
          title="Study Recommendations"
          value={recommendations.length}
          subtitle={`${viewedRecsCount} accessed by students`}
          icon={<BookMarked className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Awaiting Student Review"
          value={unreadRecsCount}
          subtitle="Unread learning resources"
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Draft Marks Pending"
          value={pendingRecords.length}
          subtitle="Awaiting administrator lock"
          icon={<Award className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Prominent Mentee Directory (Card Grid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#F5F3FA] tracking-tight">
              Assigned Mentee Cohort
            </h3>
            <p className="text-xs text-[#AAA2B8]">
              Personal dossiers, semester progress, and direct contact channels
            </p>
          </div>
          <Link to="/mentor/mentees">
            <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Full Cohort List
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignedMentees.map((mentee) => {
            const menteeRecs = recommendations.filter(r => r.mentee_id === mentee.id);
            const menteePending = pendingRecords.filter(r => r.mentee_id === mentee.id);

            return (
              <Card
                key={mentee.id}
                className="hover:border-violet-500/40 hover:shadow-glow-violet-sm transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="bg-[#12101A]/60 pb-4 border-b border-[#30263E]/60">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar name={mentee.full_name} size="md" />
                        <div>
                          <h4 className="font-bold text-sm text-[#F5F3FA]">{mentee.full_name}</h4>
                          <span className="text-[10px] text-[#777084] font-mono">
                            {mentee.usn || mentee.email}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-full">
                        Sem {mentee.semester || 5}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-4 text-xs">
                    <div className="space-y-1.5 text-[#AAA2B8]">
                      <div>
                        <span className="text-[#777084] text-[10px] uppercase font-bold tracking-wider block">
                          Department
                        </span>
                        <span className="text-[#F5F3FA] text-xs font-medium">
                          {mentee.department || 'Computer Science & Engineering'}
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[11px]">
                        <span className="text-[#777084]">Recommended Materials:</span>
                        <span className="font-semibold text-violet-300">
                          {menteeRecs.length} assigned
                        </span>
                      </div>

                      {menteePending.length > 0 && (
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <span className="text-amber-400">Draft Marks:</span>
                          <span className="font-semibold text-amber-300">
                            {menteePending.length} awaiting audit
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 bg-[#12101A]/60 border-t border-[#30263E]/60 flex items-center justify-between gap-2 text-xs">
                  {/* Contact Shortcuts */}
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`mailto:${mentee.email}`}
                      className="p-1.5 rounded-lg bg-[#191521] border border-[#30263E] text-[#AAA2B8] hover:text-[#F5F3FA] hover:border-violet-500/40 transition"
                      title={`Send email to ${mentee.email}`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                    {mentee.phone && (
                      <a
                        href={`tel:${mentee.phone}`}
                        className="p-1.5 rounded-lg bg-[#191521] border border-[#30263E] text-[#4ADEA8] hover:bg-[#4ADEA8]/10 transition"
                        title={`Call ${mentee.phone}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <Link to={`/mentor/mentees/${mentee.id}`}>
                    <Button size="sm" variant="outline" className="text-xs py-1 px-3">
                      View Dossier
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Lower Section: Recommendations & Follow-Up Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Study Recommendations</CardTitle>
                <p className="text-xs text-[#AAA2B8] mt-0.5">
                  Resources, syllabus notes, and URLs shared with your cohort
                </p>
              </div>
              <Link to="/mentor/recommendations">
                <Button size="sm" variant="ghost" className="text-xs">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.length === 0 ? (
                <EmptyState
                  icon={<BookMarked className="w-6 h-6 text-violet-400" />}
                  title="No Recommendations Assigned"
                  description="Share lecture notes, reference PDFs, or study guides with your mentees."
                  actionText="Add Recommendation"
                />
              ) : (
                recommendations.slice(0, 5).map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl border border-[#30263E] bg-[#12101A]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-violet-500/40 transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-md">
                          {rec.subject}
                        </span>
                        <h4 className="text-xs font-bold text-[#F5F3FA] truncate">
                          {rec.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#AAA2B8] line-clamp-1">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-[#777084]">
                        <span>Assigned to: <strong className="text-[#F5F3FA]">{rec.mentee?.full_name || 'Cohort Mentee'}</strong></span>
                        <span>&bull;</span>
                        <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0 self-end sm:self-center">
                      {rec.is_viewed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#4ADEA8] bg-[#4ADEA8]/10 border border-[#4ADEA8]/30 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Read
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#FBBF74] bg-[#FBBF74]/10 border border-[#FBBF74]/30 px-2 py-0.5 rounded-full font-medium">
                          <Clock className="w-3 h-3" /> Unread
                        </span>
                      )}

                      {rec.resource_url && (
                        <a
                          href={rec.resource_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-[#191521] border border-[#30263E] text-[#AAA2B8] hover:text-[#F5F3FA] transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Quick Actions & Counseling Logs */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Link
                to="/mentor/recommendations"
                className="p-3 rounded-xl bg-[#12101A] border border-[#30263E] hover:border-violet-500/40 hover:bg-[#211A2D] transition block group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#F5F3FA] group-hover:text-violet-200">
                    Recommend Study Material
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#777084] group-hover:text-violet-300 transform group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[11px] text-[#777084]">
                  Assign reference links, syllabus PDFs, and exam prep notes.
                </p>
              </Link>

              <Link
                to="/mentor/notes"
                className="p-3 rounded-xl bg-[#12101A] border border-[#30263E] hover:border-violet-500/40 hover:bg-[#211A2D] transition block group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#F5F3FA] group-hover:text-violet-200">
                    Record Counseling Note
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#777084] group-hover:text-violet-300 transform group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[11px] text-[#777084]">
                  Keep private observations visible only to faculty and admin.
                </p>
              </Link>

              <Link
                to="/mentor/mentees"
                className="p-3 rounded-xl bg-[#12101A] border border-[#30263E] hover:border-violet-500/40 hover:bg-[#211A2D] transition block group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#F5F3FA] group-hover:text-violet-200">
                    Inspect Cohort Marks
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#777084] group-hover:text-violet-300 transform group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[11px] text-[#777084]">
                  Review official SGPA and subject-wise examination scores.
                </p>
              </Link>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};
