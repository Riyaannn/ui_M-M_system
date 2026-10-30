import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbStore } from './dbStore';
import { AuditLog } from '../types';

export const auditService = {
  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*, actor:actor_id(*)')
          .order('created_at', { ascending: false })
          .limit(100);
        if (error) throw error;
        return (data || []) as AuditLog[];
      } catch (e) {
        console.warn('Supabase audit logs query failed, falling back to local store', e);
      }
    }
    return dbStore.getAuditLogs();
  },

  async logEvent(
    actorId: string | null,
    action: string,
    targetType: string,
    targetId?: string,
    details: Record<string, any> = {}
  ): Promise<AuditLog> {
    if (isSupabaseConfigured && actorId) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .insert({
            actor_id: actorId,
            action,
            target_type: targetType,
            target_id: targetId || null,
            details,
          })
          .select()
          .single();
        if (!error && data) return data as AuditLog;
      } catch (e) {
        console.warn('Supabase audit log insert failed', e);
      }
    }

    return dbStore.logAction(actorId, action, targetType, targetId, details);
  },
};

