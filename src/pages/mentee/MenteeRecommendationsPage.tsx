import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbStore } from '../../services/dbStore';
import { recommendationService } from '../../services/recommendationService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
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
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Recommended Study Notes &amp; Resources"
        subtitle="Subject materials, reference URLs, and syllabus guides curated by your faculty mentor"
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <BookMarked className="w-3.5 h-3.5 text-violet-400" />
            <span>Academic Resource Library &bull; {unreadCount} New Items</span>
          </div>
        }
      />

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendations.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<BookMarked className="w-8 h-8 text-violet-400" />}
              title="No Study Notes Assigned Yet"
              description="Your mentor hasn't assigned any study materials yet. Check back following your next mentoring session."
            />
          </div>
        ) : (
          recommendations.map((rec) => (
            <Card
              key={rec.id}
              className={`overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                !rec.is_viewed
                  ? 'border-violet-500/40 shadow-glow-violet-sm'
                  : 'hover:border-[#30263E]/80'
              }`}
            >
              <div>
                <CardHeader className="bg-[#12101A]/60 pb-3 border-b border-[#30263E]/60">
                  <div className="flex items-start justify-between w-full gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-md">
                      {rec.subject}
                    </span>
                    {rec.is_viewed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#4ADEA8] bg-[#4ADEA8]/10 border border-[#4ADEA8]/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Read
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#FBBF74] bg-[#FBBF74]/10 border border-[#FBBF74]/30 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> New
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-4 text-xs">
                  <div>
                    <h3 className="font-bold text-sm text-[#F5F3FA] leading-snug">
                      {rec.title}
                    </h3>
                    <p className="text-[#AAA2B8] text-xs mt-1.5 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#30263E]/60 space-y-1 text-[11px] text-[#777084]">
                    <div>
                      Assigned by: <strong className="text-[#F5F3FA]">{rec.mentor?.full_name || 'Faculty Mentor'}</strong>
                    </div>
                    <div>
                      Date: {new Date(rec.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 bg-[#12101A]/60 border-t border-[#30263E]/60 flex items-center justify-between gap-2 text-xs">
                <div>
                  {rec.resource_url && (
                    <a
                      href={rec.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-violet-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Resource
                    </a>
                  )}
                </div>

                {!rec.is_viewed ? (
                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs py-1 px-3"
                    onClick={() => handleMarkAsRead(rec)}
                  >
                    Mark as Read
                  </Button>
                ) : (
                  <span className="text-[10px] text-[#777084] font-mono">Reviewed</span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
