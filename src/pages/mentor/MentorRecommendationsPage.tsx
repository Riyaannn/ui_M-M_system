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
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { UserProfile, Recommendation } from '../../types';
import { 
  BookMarked, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Upload,
  Calendar,
  User,
  Sparkles
} from 'lucide-react';

export const MentorRecommendationsPage: React.FC = () => {
  const { profile } = useAuth();
  const { success, error } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [mentees, setMentees] = useState<UserProfile[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<Recommendation | null>(null);

  // Form State
  const [menteeId, setMenteeId] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState<'url' | 'document' | 'note'>('url');
  const [resourceUrl, setResourceUrl] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    if (!profile) return;
    const recs = dbStore.getRecommendations({ mentorId: profile.id });
    setRecommendations(recs);

    const m = dbStore.getMenteesByMentorId(profile.id);
    setMentees(m);
    if (m.length > 0 && !menteeId) {
      setMenteeId(m[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleOpenCreateModal = () => {
    setEditingRec(null);
    setTitle('');
    setSubject('');
    setDescription('');
    setResourceUrl('');
    setFollowUpDate('');
    setResourceType('url');
    if (mentees.length > 0) setMenteeId(mentees[0].id);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: Recommendation) => {
    setEditingRec(rec);
    setMenteeId(rec.mentee_id);
    setTitle(rec.title);
    setSubject(rec.subject);
    setDescription(rec.description);
    setResourceType(rec.resource_type);
    setResourceUrl(rec.resource_url || '');
    setFollowUpDate(rec.follow_up_date || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!title || !subject || !description) {
      error('Title, Subject, and Description are required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRec) {
        await recommendationService.updateRecommendation(editingRec.id, {
          title,
          subject,
          description,
          resource_type: resourceType,
          resource_url: resourceUrl || null,
          follow_up_date: followUpDate || null,
        }, profile.id);
        success('Recommendation updated');
      } else {
        await recommendationService.createRecommendation({
          mentor_id: profile.id,
          mentee_id: menteeId,
          title,
          subject,
          description,
          resource_type: resourceType,
          resource_url: resourceUrl || null,
          file_path: null,
          follow_up_date: followUpDate || null,
        }, profile.id);
        success('Study recommendation assigned to student');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to save recommendation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!profile) return;
    try {
      await recommendationService.deleteRecommendation(id, profile.id);
      success('Recommendation deleted');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to remove recommendation');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Study Recommendations &amp; Resources"
        subtitle="Publish study guides, PDFs, and reference URLs to your undergraduate mentees"
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <BookMarked className="w-3.5 h-3.5 text-violet-400" />
            <span>Academic Resource Center &bull; NMAMIT, Nitte</span>
          </div>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateModal}
          >
            Assign Study Notes
          </Button>
        }
      />

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendations.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<BookMarked className="w-8 h-8 text-violet-400" />}
              title="No Study Recommendations Yet"
              description="Help your mentees prepare for semester exams by sharing study guides, reference links, and subject resources."
              actionText="Create First Recommendation"
              onAction={handleOpenCreateModal}
            />
          </div>
        ) : (
          recommendations.map((rec) => (
            <Card
              key={rec.id}
              className="overflow-hidden flex flex-col justify-between hover:border-violet-500/40 hover:shadow-glow-violet-sm transition-all duration-200"
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
                        <Clock className="w-3 h-3" /> Unread
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-4 text-xs">
                  <div>
                    <h4 className="font-bold text-sm text-[#F5F3FA] leading-snug">
                      {rec.title}
                    </h4>
                    <p className="text-[#AAA2B8] text-xs mt-1.5 leading-relaxed line-clamp-3">
                      {rec.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#30263E]/60 space-y-1.5 text-[11px] text-[#777084]">
                    <div className="flex items-center justify-between">
                      <span>Assigned to:</span>
                      <strong className="text-[#F5F3FA]">{rec.mentee?.full_name || 'Mentee'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Assigned on:</span>
                      <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                    </div>
                    {rec.viewed_at && (
                      <div className="flex items-center justify-between text-[#4ADEA8]">
                        <span>Read on:</span>
                        <span>{new Date(rec.viewed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>

              <div className="p-4 bg-[#12101A]/60 border-t border-[#30263E]/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {rec.resource_url && (
                    <a
                      href={rec.resource_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Resource
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(rec)}
                    className="p-1.5 text-[#AAA2B8] hover:text-[#F5F3FA] rounded-lg transition"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="p-1.5 text-[#AAA2B8] hover:text-rose-400 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Recommendation Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRec ? 'Edit Recommendation' : 'Assign Study Notes'}
        description="Share learning resources, revision materials, or links with your student"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!editingRec && (
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                Select Mentee *
              </label>
              <select
                value={menteeId}
                onChange={(e) => setMenteeId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              >
                {mentees.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.usn || m.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Resource Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Operating Systems Process Synchronization Summary"
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Operating Systems"
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
                Resource Type
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              >
                <option value="url">External Link / Web Portal</option>
                <option value="document">PDF Document / Note</option>
                <option value="note">Text Advice</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Resource URL (Optional)
            </label>
            <input
              type="url"
              value={resourceUrl}
              onChange={(e) => setResourceUrl(e.target.value)}
              placeholder="https://nptel.ac.in/courses/..."
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Guidance &amp; Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific chapters or topics the student should prioritize..."
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-4 border-t border-[#30263E]/60 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {editingRec ? 'Update' : 'Publish to Student'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
