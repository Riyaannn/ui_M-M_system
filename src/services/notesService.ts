import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbStore } from './dbStore';
import { MentorNote } from '../types';

export const notesService = {
  async getNotes(mentorId: string, menteeId?: string): Promise<MentorNote[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('mentor_notes')
          .select('*')
          .eq('mentor_id', mentorId)
          .order('created_at', { ascending: false });

        if (menteeId) {
          query = query.eq('mentee_id', menteeId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as MentorNote[];
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store', e);
      }
    }
    return dbStore.getMentorNotes(mentorId, menteeId);
  },

  async createNote(
    note: Omit<MentorNote, 'id' | 'created_at' | 'updated_at'>,
    actorId: string
  ): Promise<MentorNote> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('mentor_notes')
          .insert(note)
          .select()
          .single();
        if (error) throw error;

        dbStore.logAction(actorId, 'MENTOR_NOTE_CREATED', 'MENTOR_NOTE', data.id, {
          title: note.title,
          mentee_id: note.mentee_id,
        });

        return data as MentorNote;
      } catch (e) {
        console.warn('Supabase note insert failed, falling back to local store', e);
      }
    }

    const created = dbStore.createMentorNote(note);
    dbStore.logAction(actorId, 'MENTOR_NOTE_CREATED', 'MENTOR_NOTE', created.id, {
      title: note.title,
      mentee_id: note.mentee_id,
    });
    return created;
  },

  async deleteNote(noteId: string, actorId: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('mentor_notes')
          .delete()
          .eq('id', noteId);
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase note delete failed, falling back to local store', e);
      }
    }
    dbStore.deleteMentorNote(noteId);
    dbStore.logAction(actorId, 'MENTOR_NOTE_DELETED', 'MENTOR_NOTE', noteId);
  },
};
