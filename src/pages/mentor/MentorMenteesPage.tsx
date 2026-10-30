import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dbStore } from '../../services/dbStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { UserProfile, AccessSettings } from '../../types';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MessageSquare, 
  GraduationCap, 
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';

export const MentorMenteesPage: React.FC = () => {
  const { profile } = useAuth();
  const [mentees, setMentees] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [accessMap, setAccessMap] = useState<Record<string, AccessSettings>>({});

  useEffect(() => {
    if (!profile) return;
    const list = dbStore.getMenteesByMentorId(profile.id);
    setMentees(list);

    // Fetch access settings for each mentee
    const map: Record<string, AccessSettings> = {};
    list.forEach((m) => {
      map[m.id] = dbStore.getAccessSettings(m.id);
    });
    setAccessMap(map);
  }, [profile]);

  const filteredMentees = mentees.filter((m) => {
    const text = `${m.full_name} ${m.usn || ''} ${m.email} ${m.semester || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="My Assigned Mentees"
        subtitle={`Supervised students at NMAM Institute of Technology, Nitte (${mentees.length} total)`}
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <Users className="w-3.5 h-3.5 text-violet-400" />
            <span>Assigned Cohort &bull; Mentor Anusha</span>
          </div>
        }
        actions={
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#777084] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter mentees..."
              className="w-full pl-9 pr-3.5 py-2 bg-[#12101A] border border-[#30263E] rounded-xl text-xs text-[#F5F3FA] placeholder-[#777084] focus:outline-none focus:border-violet-500"
            />
          </div>
        }
      />

      {/* Cohort Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMentees.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-[#777084]">
            No mentees found matching "{search}".
          </div>
        ) : (
          filteredMentees.map((mentee) => {
            const settings = accessMap[mentee.id];
            const canViewContact = settings?.allow_contact_view ?? true;
            const canViewAcademic = settings?.allow_academic_view ?? true;

            return (
              <Card
                key={mentee.id}
                className="overflow-hidden flex flex-col justify-between hover:border-violet-500/40 hover:shadow-glow-violet-sm transition-all duration-200"
              >
                <div>
                  <CardHeader className="bg-[#12101A]/60 pb-4 border-b border-[#30263E]/60">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar name={mentee.full_name} size="md" />
                        <div>
                          <h4 className="font-bold text-sm text-[#F5F3FA]">{mentee.full_name}</h4>
                          <span className="text-[10px] text-[#777084] font-mono">
                            {mentee.usn || 'USN Pending'}
                          </span>
                        </div>
                      </div>
                      <Badge variant="purple" size="sm">
                        Sem {mentee.semester || 5}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3.5 pt-4 text-xs">
                    <div className="space-y-2">
                      <div>
                        <span className="text-[#777084] text-[10px] uppercase font-bold tracking-wider block">
                          Academic Department
                        </span>
                        <span className="font-medium text-[#F5F3FA]">
                          {mentee.department} &bull; {mentee.branch}
                        </span>
                      </div>

                      {/* Contact channels */}
                      <div>
                        <span className="text-[#777084] text-[10px] uppercase font-bold tracking-wider block mb-1">
                          Direct Contact
                        </span>
                        {canViewContact ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[#AAA2B8]">
                              <Mail className="w-3.5 h-3.5 text-[#777084]" />
                              <a href={`mailto:${mentee.email}`} className="hover:text-violet-300 underline truncate">
                                {mentee.email}
                              </a>
                            </div>
                            {mentee.phone ? (
                              <div className="flex items-center gap-2 text-[#AAA2B8]">
                                <Phone className="w-3.5 h-3.5 text-[#777084]" />
                                <a href={`tel:${mentee.phone}`} className="hover:text-violet-300">
                                  {mentee.phone}
                                </a>
                              </div>
                            ) : (
                              <span className="text-[#777084] italic text-[11px] block">
                                Student has not entered phone number yet
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Contact info restricted by administrator policy</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!canViewAcademic && (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Academic records view temporarily restricted by administrator</span>
                      </div>
                    )}
                  </CardContent>
                </div>

                <div className="p-4 bg-[#12101A]/60 border-t border-[#30263E]/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {canViewContact && (
                      <>
                        <a
                          href={`mailto:${mentee.email}`}
                          className="p-1.5 rounded-lg bg-[#191521] border border-[#30263E] text-[#AAA2B8] hover:text-[#F5F3FA] transition"
                          title="Compose Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                        {mentee.phone && (
                          <a
                            href={`https://wa.me/${mentee.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-[#191521] border border-[#30263E] text-[#4ADEA8] hover:bg-[#4ADEA8]/10 transition"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </>
                    )}
                  </div>

                  <Link to={`/mentor/mentees/${mentee.id}`}>
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Academic Dossier
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
