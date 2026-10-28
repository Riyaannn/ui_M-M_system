import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dbStore } from '../../services/dbStore';
import { adminService } from '../../services/adminService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-nmam-teal-600" />
            My Assigned Mentees
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervised students at NMAM Institute of Technology, Nitte ({mentees.length} total)
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mentee name, USN..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Mentee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMentees.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
            No mentees found matching your search term.
          </div>
        ) : (
          filteredMentees.map((m) => {
            const access = accessMap[m.id];
            const canViewContact = access ? access.allow_contact_view : true;
            const canViewAcademic = access ? access.allow_academic_view : true;

            const cleanPhone = m.phone ? m.phone.replace(/[^0-9]/g, '') : null;
            const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

            return (
              <Card key={m.id} className="flex flex-col justify-between overflow-hidden">
                <div>
                  <CardHeader className="bg-slate-50/50 pb-3">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-nmam-navy-100 text-nmam-navy-800 flex items-center justify-center font-bold text-sm">
                          {m.full_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">{m.full_name}</h3>
                          <div className="text-[11px] font-mono text-slate-500">
                            {m.usn || 'USN Pending'}
                          </div>
                        </div>
                      </div>
                      <Badge variant="default" size="sm">
                        Sem {m.semester || 5}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-4 text-xs">
                    <div>
                      <div className="text-slate-500 text-[11px] font-medium">Department:</div>
                      <div className="text-slate-800 font-medium">{m.department || 'Computer Science & Engg'}</div>
                    </div>

                    {/* Contact details with permission check */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                        <span>Direct Communication:</span>
                        {!canViewContact && (
                          <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Restricted by Admin
                          </span>
                        )}
                      </div>

                      {canViewContact ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <a
                              href={`mailto:${m.email}`}
                              className="text-nmam-navy-700 hover:underline truncate"
                            >
                              {m.email}
                            </a>
                          </div>

                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {m.phone ? (
                              <div className="flex items-center gap-2">
                                <a
                                  href={`tel:${m.phone}`}
                                  className="text-slate-800 hover:text-nmam-navy-700 font-medium"
                                >
                                  {m.phone}
                                </a>
                                {whatsappUrl && (
                                  <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-1.5 py-0.5 rounded font-semibold border border-emerald-200"
                                  >
                                    WhatsApp
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No contact number entered yet</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-400 italic text-[11px] bg-slate-50 p-2 rounded">
                          Contact details withheld by administrative policy.
                        </div>
                      )}
                    </div>

                    {/* Academic view status */}
                    {!canViewAcademic && (
                      <div className="p-2 rounded bg-amber-50 border border-amber-100 text-amber-800 text-[11px] flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Academic records view withheld by administrator.</span>
                      </div>
                    )}
                  </CardContent>
                </div>

                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    NMAMIT CSE
                  </span>
                  <Link to={`/mentor/mentees/${m.id}`}>
                    <Button size="sm" variant="teal" className="text-xs py-1 px-3" rightIcon={<ArrowRight className="w-3 h-3" />}>
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
