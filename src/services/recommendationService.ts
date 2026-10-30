import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbStore } from './dbStore';
import { Recommendation } from '../types';

export const recommendationService = {
  async getByMentee(menteeId: string): Promise<Recommendation[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('recommendations')
          .select(`
            *,
            mentor:mentor_id(*),
            views:recommendation_views(*)
          `)
          .eq('mentee_id', menteeId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        
        return (data || []).map((r: any) => {
          const menteeView = (r.views || []).find((v: any) => v.mentee_id === menteeId);
          return {
            ...r,
            is_viewed: Boolean(menteeView),
            viewed_at: menteeView ? menteeView.viewed_at : null,
          };
        });
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store', e);
      }
    }
    return dbStore.getRecommendations({ menteeId });
  },

  async getByMentor(mentorId: string): Promise<Recommendation[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('recommendations')
          .select(`
            *,
            mentee:mentee_id(*),
            views:recommendation_views(*)
          `)
          .eq('mentor_id', mentorId)
          .order('created_at', { ascending: false });
        if (error) throw error;

        return (data || []).map((r: any) => {
          const menteeView = (r.views || []).find((v: any) => v.mentee_id === r.mentee_id);
          return {
            ...r,
            is_viewed: Boolean(menteeView),
            viewed_at: menteeView ? menteeView.viewed_at : null,
          };
        });
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store', e);
      }
    }
    return dbStore.getRecommendations({ mentorId });
  },

  async createRecommendation(
    recommendation: Omit<Recommendation, 'id' | 'created_at' | 'updated_at' | 'is_viewed' | 'viewed_at'>,
    mentorId: string
  ): Promise<Recommendation> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('recommendations')
          .insert({
            ...recommendation,
            mentor_id: mentorId,
          })
          .select('*, mentee:mentee_id(*)')
          .single();
        if (error) throw error;

        dbStore.logAction(mentorId, 'RECOMMENDATION_CREATED', 'RECOMMENDATION', data.id, {
          title: recommendation.title,
          mentee_id: recommendation.mentee_id,
        });

        return {
          ...data,
          is_viewed: false,
          viewed_at: null,
        } as Recommendation;
      } catch (e) {
        console.warn('Supabase insert failed, falling back to local store', e);
      }
    }

    const created = dbStore.createRecommendation({
      ...recommendation,
      mentor_id: mentorId,
    });
    dbStore.logAction(mentorId, 'RECOMMENDATION_CREATED', 'RECOMMENDATION', created.id, {
      title: recommendation.title,
      mentee_id: recommendation.mentee_id,
    });
    return created;
  },

  async updateRecommendation(
    id: string,
    updates: Partial<Recommendation>,
    mentorId: string
  ): Promise<Recommendation> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('recommendations')
          .update(updates)
          .eq('id', id)
          .select('*, mentee:mentee_id(*)')
          .single();
        if (error) throw error;
        dbStore.logAction(mentorId, 'RECOMMENDATION_UPDATED', 'RECOMMENDATION', id, updates);
        return data as Recommendation;
      } catch (e) {
        console.warn('Supabase update failed, falling back to local store', e);
      }
    }

    const updated = dbStore.updateRecommendation(id, updates);
    dbStore.logAction(mentorId, 'RECOMMENDATION_UPDATED', 'RECOMMENDATION', id, updates);
    return updated;
  },

  async deleteRecommendation(id: string, mentorId: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('recommendations')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase delete failed, falling back to local store', e);
      }
    }
    dbStore.deleteRecommendation(id);
    dbStore.logAction(mentorId, 'RECOMMENDATION_DELETED', 'RECOMMENDATION', id);
  },

  async markAsViewed(recommendationId: string, menteeId: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('recommendation_views')
          .upsert({
            recommendation_id: recommendationId,
            mentee_id: menteeId,
            viewed_at: new Date().toISOString(),
          }, { onConflict: 'recommendation_id,mentee_id' });
        if (error) throw error;
        return;
      } catch (e) {
        console.warn('Supabase view insert failed, falling back to local store', e);
      }
    }
    dbStore.markRecommendationViewed(recommendationId, menteeId);
  },

  async uploadStudyMaterial(file: File): Promise<{ filePath: string; signedUrl?: string }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `materials/${fileName}`;

    if (isSupabaseConfigured) {
      try {
        const { error: uploadError } = await supabase.storage
          .from('study-materials')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });
        if (uploadError) throw uploadError;

        // Generate a 1-hour signed URL for secure download
        const { data: signData, error: signError } = await supabase.storage
          .from('study-materials')
          .createSignedUrl(filePath, 3600);
        if (signError) throw signError;

        return { filePath, signedUrl: signData.signedUrl };
      } catch (e) {
        console.warn('Supabase storage upload failed, simulating fallback', e);
      }
    }

    // Demo/offline preview: create object URL
    const demoUrl = URL.createObjectURL(file);
    return { filePath: file.name, signedUrl: demoUrl };
  },

  async getDownloadUrl(filePath: string): Promise<string> {
    if (isSupabaseConfigured && filePath.startsWith('materials/')) {
      try {
        const { data, error } = await supabase.storage
          .from('study-materials')
          .createSignedUrl(filePath, 3600);
        if (error) throw error;
        return data.signedUrl;
      } catch (e) {
        console.warn('Failed to generate signed download URL', e);
      }
    }
    return filePath;
  },
};

