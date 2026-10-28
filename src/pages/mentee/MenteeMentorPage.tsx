import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  MessageCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const MenteeMentorPage: React.FC = () => {
  const { profile } = useAuth();
  const mentor = profile?.mentor;

  const cleanPhone = mentor?.phone ? mentor.phone.replace(/[^0-9]/g, '') : null;
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-nmam-teal-600" />
          My Faculty Mentor
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          NMAMIT Academic Mentorship Programme &bull; Supervision Details
        </p>
      </div>

      {mentor ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Mentor Profile */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-nmam-navy-900 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                    {mentor.full_name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{mentor.full_name}</h2>
                    <p className="text-xs text-slate-500">{mentor.branch || 'Faculty / Mentor'}</p>
                    <Badge variant="info" size="sm" className="mt-1">
                      Assigned Supervisor
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Academic Department
                    </span>
                    <span className="text-slate-800 font-semibold text-sm">
                      {mentor.department}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Institution
                    </span>
                    <span className="text-slate-800 font-semibold text-sm">
                      NMAMIT, Nitte
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs">Official Contact Channels</h4>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <div>
                          <div className="font-semibold text-slate-800">College Email</div>
                          <div className="text-slate-500">{mentor.email}</div>
                        </div>
                      </div>
                      <a href={`mailto:${mentor.email}`}>
                        <Button size="sm" variant="outline" className="text-xs py-1 px-3">
                          Send Email
                        </Button>
                      </a>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <div>
                          <div className="font-semibold text-slate-800">Phone Contact</div>
                          <div className="text-slate-500">
                            {mentor.phone || 'Contact number not published by faculty'}
                          </div>
                        </div>
                      </div>
                      {mentor.phone && (
                        <div className="flex items-center gap-2">
                          <a href={`tel:${mentor.phone}`}>
                            <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                              Call
                            </Button>
                          </a>
                          {whatsappUrl && (
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="teal" className="text-xs py-1 px-2.5">
                                WhatsApp
                              </Button>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mentoring Guidelines */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-nmam-teal-600" />
                  <CardTitle className="text-sm">Mentoring Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-600">
                <p leading-relaxed>
                  Your faculty mentor is dedicated to assisting you with academic progress, study resource recommendations, curriculum advising, and career counseling.
                </p>
                <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 border border-slate-100 text-[11px]">
                  <div className="font-bold text-slate-800">Regular Interaction Hours:</div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mon – Fri, 3:30 PM – 5:00 PM</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>CSE Department Faculty Cabin</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <h3 className="font-bold text-sm text-slate-700">No Mentor Assigned Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              The NMAMIT Academic Office is finalizing student cohorts. You will be notified as soon as your faculty mentor is assigned.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
