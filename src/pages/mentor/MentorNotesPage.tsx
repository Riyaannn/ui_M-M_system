import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbStore } from '../../services/dbStore';
import { notesService } from '../../services/notesService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { MentorNote, UserProfile } from '../../types';
import { StickyNote, Plus, Trash2, Search, Lock, User, Clock } from 'lucide-react';

export const MentorNotesPage: React.FC = () => {
  const { profile } = useAuth();
  const { success, error } = useToast();
  const [notes, setNotes] = useState<MentorNote[]>([]);
  const [mentees, setMentees] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMenteeFilter, setSelectedMenteeFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menteeId, setMenteeId] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const loadData = async () => {
    if (!profile) return;
    const n = await notesService.getNotes(profile.id);
    setNotes(n);
    const m = dbStore.getMenteesByMentorId(profile.id);
    setMentees(m);
    if (m.length > 0 && !menteeId) {
      setMenteeId(m[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !menteeId || !title || !content) return;

    try {
      await notesService.createNote({
        mentor_id: profile.id,
        mentee_id: menteeId,
        title,
        subject: subject || null,
        note_content: content,
        visibility: 'private',
      }, profile.id);

      success('Private observation logged');
      setIsModalOpen(false);
      setTitle('');
      setSubject('');
      setContent('');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to save note');
    }
  };

  const handleDelete = async (id: string) => {
    if (!profile) return;
    try {
      await notesService.deleteNote(id, profile.id);
      success('Observation note removed');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to delete note');
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchesMentee = selectedMenteeFilter === 'all' || n.mentee_id === selectedMenteeFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q || n.title.toLowerCase().includes(q) || n.note_content.toLowerCase().includes(q);
    return matchesMentee && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Private Counseling Notes"
        subtitle="Confidential academic observations and counseling logs for faculty mentors"
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] text-[#AAA2B8]">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Confidential Faculty Log &bull; Isolated from Mentees</span>
          </div>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Observation
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#777084] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes content, title, subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-[#12101A] border border-[#30263E] rounded-xl text-xs text-[#F5F3FA] placeholder-[#777084] focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <select
                value={selectedMenteeFilter}
                onChange={(e) => setSelectedMenteeFilter(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#12101A] border border-[#30263E] rounded-xl text-xs text-[#F5F3FA] focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Assigned Mentees</option>
                {mentees.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.usn || m.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<StickyNote className="w-8 h-8 text-amber-400" />}
              title="No Private Notes Found"
              description="Keep confidential notes regarding attendance, academic difficulties, or counseling discussions."
              actionText="Record First Observation"
              onAction={() => setIsModalOpen(true)}
            />
          </div>
        ) : (
          filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="border-amber-500/20 hover:border-amber-500/40 hover:shadow-glow-violet-sm transition-all flex flex-col justify-between"
            >
              <div>
                <CardHeader className="bg-[#12101A]/60 pb-3 border-b border-[#30263E]/60">
                  <div className="flex items-start justify-between w-full gap-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                        Private Observation
                      </span>
                    </div>
                    <span className="text-[10px] text-[#777084] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-4 text-xs">
                  <div>
                    <h4 className="font-bold text-sm text-[#F5F3FA] leading-snug">
                      {note.title}
                    </h4>
                    {note.subject && (
                      <span className="inline-block mt-1 text-[10px] font-mono bg-[#12101A] border border-[#30263E] text-violet-300 px-2 py-0.5 rounded">
                        Subject: {note.subject}
                      </span>
                    )}
                    <p className="text-[#AAA2B8] text-xs mt-2 leading-relaxed whitespace-pre-wrap">
                      {note.note_content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#30263E]/60 flex items-center gap-2 text-[11px] text-[#777084]">
                    <User className="w-3.5 h-3.5 text-[#AAA2B8]" />
                    <span>Mentee: <strong className="text-[#F5F3FA]">{mentees.find(m => m.id === note.mentee_id)?.full_name || 'Assigned Mentee'}</strong></span>
                  </div>
                </CardContent>
              </div>

              <div className="p-3 bg-[#12101A]/60 border-t border-[#30263E]/60 flex items-center justify-end">
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-1.5 text-[#777084] hover:text-rose-400 rounded-lg transition"
                  title="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Confidential Observation"
        description="Private counseling note strictly visible to faculty mentors and administrators."
      >
        <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
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

          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Observation Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CIE Performance Review Discussion"
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Subject Code / Area (Optional)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. 22CS502 Computer Networks"
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#AAA2B8] uppercase tracking-wider mb-1">
              Confidential Observation Content *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Record mentor counseling observations, attendance issues, or targeted improvement actions..."
              className="w-full px-3.5 py-2.5 bg-[#12101A] border border-[#30263E] rounded-xl text-sm text-[#F5F3FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-4 border-t border-[#30263E]/60 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Log Observation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
