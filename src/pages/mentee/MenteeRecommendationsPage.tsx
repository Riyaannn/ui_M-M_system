import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbStore } from '../../services/dbStore';
import { recommendationService } from '../../services/recommendationService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Recommendation } from '../../types';
import { 
  BookMarked, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  Clock, 
  Calendar, 
  Eye, 
  FileText 
} from 'lucide-react';

export const MenteeRecommendationsPage: React.FC = () => {
  const { profile } = useAuth();
  const { success, error } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

  const loadData = () => {
    if (!profile) return;
    const recs = dbStore.getRecommendations({ menteeId: profile.id });
    setRecommendations(recs);
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleMarkAsRead = async (rec: Recommendation) => {
    if (!profile) return;
    try {
      await recommendationService.markAsViewed(rec.id, profile.id);
      success(`Marked "${rec.title}" as reviewed`);
      loadData();
      if (selectedRec?.id === rec.id) {
        setSelectedRec({ ...selectedRec, is_viewed: true, viewed_at: new Date().toISOString() });
      }
    } catch (err: any) {
      error(err.message || 'Failed to update read status');
    }
  };

  const unreadCount = recommendations.filter(r => !r.is_viewed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-nmam-teal-600" />
            Recommended Notes & Learning Resources
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Study materials and syllabus guidelines assigned by your mentor ({unreadCount} unread)
          </p>
        </div>
      </div>

      {/* Grid of Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
            No study recommendations assigned yet by your mentor.
          </div>
        ) : (
          recommendations.map((rec) => (
            <Card key={rec.id} className="flex flex-col justify-between overflow-hidden">
              <div>
                <CardHeader className="bg-slate-50/50 pb-3">
                  <div className="flex items-start justify-between w-full">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-nmam-teal-700 bg-nmam-teal-50 px-2 py-0.5 rounded border border-nmam-teal-100">
                        {rec.subject}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-1.5">{rec.title}</h3>
                    </div>

                    {rec.is_viewed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3.5 h-3.5" /> New / Unread
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-4 text-xs">
                  <p className="text-slate-600 leading-relaxed line-clamp-3">
                    {rec.description}
                  </p>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <div>
                      <span className="font-medium text-slate-400 block">Recommended By:</span>
                      <span className="font-semibold text-slate-800">
                        {rec.mentor?.full_name || 'Faculty Mentor'}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium text-slate-400 block">Assigned Date:</span>
                      <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                    </div>

                    <div>
                      <span className="font-medium text-slate-400 block">Target Follow-Up:</span>
                      <span className="font-medium text-slate-700">
                        {rec.follow_up_date || 'None scheduled'}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium text-slate-400 block">Status:</span>
                      <span>
                        {rec.is_viewed
                          ? `Read on ${new Date(rec.viewed_at!).toLocaleDateString()}`
                          : 'Pending your review'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs py-1"
                  onClick={() => setSelectedRec(rec)}
                >
                  View Details
                </Button>

                <div className="flex items-center gap-2">
                  {rec.resource_url && (
                    <a
                      href={rec.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (!rec.is_viewed) handleMarkAsRead(rec);
                      }}
                    >
                      <Button size="sm" variant="teal" className="text-xs py-1" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Open Resource
                      </Button>
                    </a>
                  )}

                  {!rec.is_viewed && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs py-1"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      onClick={() => handleMarkAsRead(rec)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Details Modal */}
      {selectedRec && (
        <Modal
          isOpen={Boolean(selectedRec)}
          onClose={() => setSelectedRec(null)}
          title={selectedRec.title}
          description={`Subject: ${selectedRec.subject}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">
                Guidance & Notes from Mentor
              </span>
              <p className="text-sm text-slate-800 leading-relaxed mt-1 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">
                {selectedRec.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-600 border-t border-slate-100 pt-3">
              <div>
                <span className="font-semibold text-slate-400 block">Mentor:</span>
                <span className="font-semibold text-slate-800">
                  {selectedRec.mentor?.full_name || 'Faculty Mentor'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 block">Follow-Up Target:</span>
                <span>{selectedRec.follow_up_date || 'Self-paced'}</span>
              </div>
            </div>

            {selectedRec.resource_url && (
              <div className="pt-2">
                <a
                  href={selectedRec.resource_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-nmam-navy-900 hover:bg-nmam-navy-800 text-white rounded-lg font-semibold transition"
                  onClick={() => {
                    if (!selectedRec.is_viewed) handleMarkAsRead(selectedRec);
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Access Full Study Resource URL
                </a>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <div>
                {selectedRec.is_viewed ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Marked as Read
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAsRead(selectedRec)}
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedRec(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
