import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbStore } from '../../services/dbStore';
import { notesService } from '../../services/notesService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { MentorNote, UserProfile } from '../../types';
import { StickyNote, Plus, Trash2, Search, Lock, User } from 'lucide-react';

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
      error(err.message || 'Failed to create note');
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!profile) return;
    try {
      await notesService.deleteNote(noteId, profile.id);
      success('Observation note removed');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to delete note');
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchesFilter = selectedMenteeFilter === 'all' || n.mentee_id === selectedMenteeFilter;
    const matchesSearch = `${n.title} ${n.note_content} ${n.subject || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <StickyNote className="w-6 h-6 text-amber-600" />
            Confidential Mentor Observations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Private counseling logs and academic progress remarks visible exclusively to you
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add New Observation
        </Button>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search observation notes..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={selectedMenteeFilter}
                onChange={(e) => setSelectedMenteeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none text-slate-700"
              >
                <option value="all">All Mentees</option>
                {mentees.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
            No private observation notes found.
          </div>
        ) : (
          filteredNotes.map((note) => {
            const student = mentees.find(m => m.id === note.mentee_id);
            return (
              <Card key={note.id} className="flex flex-col justify-between">
                <div>
                  <CardHeader className="bg-amber-50/40 pb-3">
                    <div className="flex items-start justify-between w-full">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800">
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>Student: {student?.full_name || 'Assigned Mentee'}</span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 mt-1">{note.title}</h3>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-3 text-xs space-y-2">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {note.note_content}
                    </p>
                    {note.subject && (
                      <div className="text-[11px] font-semibold text-nmam-teal-700 pt-1">
                        Context: {note.subject}
                      </div>
                    )}
                  </CardContent>
                </div>

                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    Private &bull; Not visible to mentee
                  </span>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete observation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal: Add Observation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Private Mentoring Observation"
        description="Records confidential remarks about mentee behavior, performance, or counseling sessions."
      >
        <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Mentee *</label>
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
            <label className="block font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CIE Performance Review"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject / Focus</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Study habits, Algorithms, Project guidance"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Observation *</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter comprehensive counseling notes and observations..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-nmam-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm">
              Save Private Observation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
