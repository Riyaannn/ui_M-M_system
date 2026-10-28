import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbStore } from '../../services/dbStore';
import { recommendationService } from '../../services/recommendationService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
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
  User
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
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
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

  const handleOpenCreate = () => {
    setEditingRec(null);
    setTitle('');
    setSubject('');
    setDescription('');
    setResourceUrl('');
    setResourceType('url');
    setFollowUpDate('');
    setFileToUpload(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: Recommendation) => {
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
    if (!profile || !menteeId || !title || !subject || !description) {
      error('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalUrl = resourceUrl;
      let finalFilePath = editingRec?.file_path || null;

      if (fileToUpload) {
        const uploadResult = await recommendationService.uploadStudyMaterial(fileToUpload);
        finalFilePath = uploadResult.filePath;
        if (uploadResult.signedUrl) {
          finalUrl = uploadResult.signedUrl;
        }
      }

      if (editingRec) {
        await recommendationService.updateRecommendation(
          editingRec.id,
          {
            mentee_id: menteeId,
            title,
            subject,
            description,
            resource_type: resourceType,
            resource_url: finalUrl || null,
            file_path: finalFilePath,
            follow_up_date: followUpDate || null,
          },
          profile.id
        );
        success('Recommendation updated successfully');
      } else {
        await recommendationService.createRecommendation(
          {
            mentor_id: profile.id,
            mentee_id: menteeId,
            title,
            subject,
            description,
            resource_type: resourceType,
            resource_url: finalUrl || null,
            file_path: finalFilePath,
            follow_up_date: followUpDate || null,
          },
          profile.id
        );
        success('Study recommendation assigned to mentee');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to save recommendation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (recId: string) => {
    if (!profile) return;
    try {
      await recommendationService.deleteRecommendation(recId, profile.id);
      success('Recommendation deleted');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to delete recommendation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-nmam-teal-600" />
            Study Materials & Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Curate learning resources, tutorial URLs, and exam preparation notes for your mentees
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          New Recommendation
        </Button>
      </div>

      {/* Recommendations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
            No study recommendations created yet. Click the button above to assign learning materials to your mentees.
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
                        <CheckCircle2 className="w-3.5 h-3.5" /> Read
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3.5 h-3.5" /> Unread
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-4 text-xs">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {rec.description}
                  </p>

                  {/* Resource link */}
                  {rec.resource_url && (
                    <div className="pt-2">
                      <a
                        href={rec.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-nmam-navy-700 hover:text-nmam-navy-900 font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Learning Resource
                      </a>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <div>
                      <span className="font-medium text-slate-400 block">Assigned Mentee:</span>
                      <span className="font-semibold text-slate-800">{rec.mentee?.full_name}</span>
                    </div>

                    <div>
                      <span className="font-medium text-slate-400 block">Follow-Up Date:</span>
                      <span>{rec.follow_up_date || 'No deadline'}</span>
                    </div>

                    <div>
                      <span className="font-medium text-slate-400 block">Recommended On:</span>
                      <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                    </div>

                    <div>
                      <span className="font-medium text-slate-400 block">Mentee Last Viewed:</span>
                      <span>
                        {rec.viewed_at
                          ? new Date(rec.viewed_at).toLocaleDateString()
                          : 'Not accessed yet'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Edit3 className="w-3 h-3" />}
                  onClick={() => handleOpenEdit(rec)}
                  className="text-xs py-1 px-2.5"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Trash2 className="w-3 h-3 text-rose-500" />}
                  onClick={() => handleDelete(rec.id)}
                  className="text-xs py-1 px-2.5 text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create / Edit Recommendation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRec ? 'Edit Study Recommendation' : 'Assign Study Recommendation'}
        description="Share reference materials, NPTEL course notes, or PDF documents with your mentee."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Mentee *</label>
            <select
              required
              value={menteeId}
              onChange={(e) => setMenteeId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            >
              {mentees.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.usn || m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Recommendation Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dynamic Programming - Bellman-Ford Memoization"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject / Course Name *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Design & Analysis of Algorithms (22CS501)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Description & Guidance *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain key concepts to focus on, chapter references, and practice exercises..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Resource Type</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="resType"
                  value="url"
                  checked={resourceType === 'url'}
                  onChange={() => setResourceType('url')}
                />
                <span>Web URL / NPTEL Link</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="resType"
                  value="document"
                  checked={resourceType === 'document'}
                  onChange={() => setResourceType('document')}
                />
                <span>PDF Document Upload</span>
              </label>
            </div>
          </div>

          {resourceType === 'url' ? (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Web Resource URL</label>
              <input
                type="url"
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                placeholder="https://nptel.ac.in/... or external tutorial"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Upload PDF Document</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileToUpload(e.target.files[0]);
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-nmam-navy-100 file:text-nmam-navy-800 hover:file:bg-nmam-navy-200"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Follow-Up Review Date (Optional)</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" isLoading={isSubmitting}>
              {editingRec ? 'Save Changes' : 'Publish Recommendation'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
