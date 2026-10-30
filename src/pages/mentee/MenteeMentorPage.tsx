import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  MessageSquare,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const MenteeMentorPage: React.FC = () => {
  const { profile } = useAuth();
  const mentor = profile?.mentor;

  const cleanPhone = mentor?.phone ? mentor.phone.replace(/[^0-9]/g, '') : null;
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="My Faculty Mentor"
        subtitle="Supervision profile, official contact channels, and office hours for NMAMIT, Nitte"
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
            <span>Faculty Mentoring Programme</span>
          </div>
        }
      />

      {mentor ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Mentor Profile */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="bg-[#12101A]/60 pb-4 border-b border-[#30263E]/60">
                <div className="flex items-center gap-4">
                  <ProfileAvatar name={mentor.full_name} size="lg" />
                  <div>
                    <h2 className="text-lg font-bold text-[#F5F3FA]">{mentor.full_name}</h2>
                    <p className="text-xs text-[#AAA2B8]">{mentor.branch || 'Faculty Mentor'}</p>
                    <Badge variant="purple" size="sm" className="mt-1">
                      Assigned Supervisor
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[#777084] font-semibold block uppercase tracking-wider text-[10px]">
                      Academic Department
                    </span>
                    <span className="font-semibold text-[#F5F3FA] text-sm mt-0.5 block">
                      {mentor.department || 'Computer Science & Engineering'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#777084] font-semibold block uppercase tracking-wider text-[10px]">
                      Institution Affiliation
                    </span>
                    <span className="font-semibold text-[#F5F3FA] text-sm mt-0.5 block">
                      {mentor.college || 'NMAMIT, Nitte'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#30263E]/60">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#777084]">
                    Direct Communication Channels
                  </h4>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#12101A] border border-[#30263E]">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-violet-400" />
                      <div>
                        <div className="text-[10px] text-[#777084] uppercase font-bold">Email</div>
                        <a href={`mailto:${mentor.email}`} className="text-violet-300 font-medium underline">
                          {mentor.email}
                        </a>
                      </div>
                    </div>
                    <a
                      href={`mailto:${mentor.email}`}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 transition"
                    >
                      Compose
                    </a>
                  </div>

                  {mentor.phone && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#12101A] border border-[#30263E]">
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-[#4ADEA8]" />
                        <div>
                          <div className="text-[10px] text-[#777084] uppercase font-bold">Phone</div>
                          <a href={`tel:${mentor.phone}`} className="text-[#F5F3FA] font-medium">
                            {mentor.phone}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${mentor.phone}`}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#211A2D] text-[#F5F3FA] border border-[#30263E] hover:bg-[#30263E] transition"
                        >
                          Call
                        </a>
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#4ADEA8]/15 text-[#4ADEA8] border border-[#4ADEA8]/30 hover:bg-[#4ADEA8]/25 transition"
                          >
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mentoring Guidelines Card */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-400" />
                  <CardTitle className="text-sm">Office Hours &amp; Sessions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-[#AAA2B8] leading-relaxed">
                  Regular mentor–mentee sessions are conducted bi-weekly in the department staff room or via scheduled appointments.
                </p>

                <div className="p-3 rounded-xl bg-[#12101A] border border-[#30263E] space-y-1">
                  <div className="font-semibold text-[#F5F3FA]">Standard Meeting Hours:</div>
                  <div className="text-[11px] text-[#AAA2B8]">Tuesdays &amp; Thursdays: 3:30 PM – 4:30 PM</div>
                  <div className="text-[10px] text-[#777084]">CSE Department Faculty Block, NMAMIT</div>
                </div>

                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-200 text-[11px] leading-relaxed">
                  Tip: Review assigned study recommendations before attending your counseling session.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-xs text-[#777084]">
            No faculty mentor assigned to your student profile yet. Please contact the NMAMIT administration office.
          </CardContent>
        </Card>
      )}
    </div>
  );
};
