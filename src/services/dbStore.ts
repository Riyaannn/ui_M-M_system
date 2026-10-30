import { 
  UserProfile, 
  AccessSettings, 
  AcademicRecord, 
  Recommendation, 
  MentorNote, 
  AuditLog, 
  VerificationStatus,
  ResultStatus
} from '../types';
import { 
  INITIAL_PROFILES, 
  INITIAL_ADMIN_ID,
  INITIAL_ACCESS_SETTINGS, 
  INITIAL_RECOMMENDATIONS, 
  INITIAL_MENTOR_NOTES, 
  INITIAL_ACADEMIC_RECORDS, 
  INITIAL_AUDIT_LOGS 
} from '../lib/mockData';

const STORAGE_KEY = 'nmamit_portal_db_v1';

interface LocalDBState {
  profiles: UserProfile[];
  accessSettings: AccessSettings[];
  academicRecords: AcademicRecord[];
  recommendations: Recommendation[];
  mentorNotes: MentorNote[];
  auditLogs: AuditLog[];
}

function loadInitialState(): LocalDBState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.profiles && parsed.profiles.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached local DB state', e);
  }

  const defaultState: LocalDBState = {
    profiles: INITIAL_PROFILES,
    accessSettings: INITIAL_ACCESS_SETTINGS,
    academicRecords: INITIAL_ACADEMIC_RECORDS,
    recommendations: INITIAL_RECOMMENDATIONS,
    mentorNotes: INITIAL_MENTOR_NOTES,
    auditLogs: INITIAL_AUDIT_LOGS,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  } catch (e) {
    // Ignore in SSR/memory
  }

  return defaultState;
}

let state: LocalDBState = loadInitialState();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to persist local DB state', e);
  }
}

export const dbStore = {
  // Reset to initial demo state
  resetToDefault(): void {
    state = {
      profiles: [...INITIAL_PROFILES],
      accessSettings: [...INITIAL_ACCESS_SETTINGS],
      academicRecords: [...INITIAL_ACADEMIC_RECORDS],
      recommendations: [...INITIAL_RECOMMENDATIONS],
      mentorNotes: [...INITIAL_MENTOR_NOTES],
      auditLogs: [...INITIAL_AUDIT_LOGS],
    };
    persist();
  },

  // Profiles
  getProfiles(): UserProfile[] {
    return state.profiles.map(p => {
      const mentor = p.mentor_id ? state.profiles.find(m => m.id === p.mentor_id) || null : null;
      return { ...p, mentor };
    });
  },

  getProfileById(id: string): UserProfile | null {
    const profile = state.profiles.find(p => p.id === id);
    if (!profile) return null;
    const mentor = profile.mentor_id ? state.profiles.find(m => m.id === profile.mentor_id) || null : null;
    return { ...profile, mentor };
  },

  getMenteesByMentorId(mentorId: string): UserProfile[] {
    return state.profiles
      .filter(p => p.role === 'mentee' && p.mentor_id === mentorId)
      .map(p => ({
        ...p,
        mentor: state.profiles.find(m => m.id === mentorId) || null,
      }));
  },

  getAllMentees(): UserProfile[] {
    return state.profiles
      .filter(p => p.role === 'mentee')
      .map(p => {
        const mentor = p.mentor_id ? state.profiles.find(m => m.id === p.mentor_id) || null : null;
        return { ...p, mentor };
      });
  },

  getAllMentors(): UserProfile[] {
    return state.profiles.filter(p => p.role === 'mentor');
  },

  updateProfile(id: string, updates: Partial<UserProfile>, actorId?: string): UserProfile {
    const idx = state.profiles.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Profile not found');
    
    const existing = state.profiles[idx];
    const actor = actorId ? state.profiles.find(p => p.id === actorId) : null;
    const isAdmin = actor?.role === 'admin' || actorId === INITIAL_ADMIN_ID;

    // Privilege protection (mirroring PostgreSQL protect_profile_privileges trigger)
    const sanitizedUpdates = { ...updates };
    if (!isAdmin) {
      delete sanitizedUpdates.role;
      delete sanitizedUpdates.mentor_id;
      delete sanitizedUpdates.is_active;
    }

    state.profiles[idx] = {
      ...existing,
      ...sanitizedUpdates,
      updated_at: new Date().toISOString(),
    };
    persist();
    return this.getProfileById(id)!;
  },

  createProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> & { id?: string }): UserProfile {
    const id = profile.id || `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newProfile: UserProfile = {
      ...profile,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.profiles.push(newProfile);

    // If new mentee, create default access settings
    if (newProfile.role === 'mentee') {
      state.accessSettings.push({
        id: `acc-${Date.now()}`,
        mentee_id: id,
        mentor_id: newProfile.mentor_id || null,
        allow_academic_view: true,
        allow_profile_edit: true,
        allow_contact_view: true,
        updated_at: new Date().toISOString(),
      });
    }

    persist();
    return this.getProfileById(id)!;
  },

  assignMenteeToMentor(menteeId: string, mentorId: string | null): UserProfile {
    const idx = state.profiles.findIndex(p => p.id === menteeId);
    if (idx === -1) throw new Error('Profile not found');

    state.profiles[idx].mentor_id = mentorId;
    state.profiles[idx].updated_at = new Date().toISOString();

    // update access settings too
    const accIdx = state.accessSettings.findIndex(a => a.mentee_id === menteeId);
    if (accIdx !== -1) {
      state.accessSettings[accIdx].mentor_id = mentorId;
      state.accessSettings[accIdx].updated_at = new Date().toISOString();
    }
    persist();
    return this.getProfileById(menteeId)!;
  },

  // Access Settings
  getAccessSettings(menteeId: string): AccessSettings {
    let settings = state.accessSettings.find(a => a.mentee_id === menteeId);
    if (!settings) {
      settings = {
        id: `acc-${Date.now()}`,
        mentee_id: menteeId,
        mentor_id: null,
        allow_academic_view: true,
        allow_profile_edit: true,
        allow_contact_view: true,
        updated_at: new Date().toISOString(),
      };
      state.accessSettings.push(settings);
      persist();
    }
    return settings;
  },

  updateAccessSettings(menteeId: string, updates: Partial<AccessSettings>, updatedBy?: string): AccessSettings {
    const idx = state.accessSettings.findIndex(a => a.mentee_id === menteeId);
    if (idx === -1) {
      const newSettings: AccessSettings = {
        id: `acc-${Date.now()}`,
        mentee_id: menteeId,
        allow_academic_view: true,
        allow_profile_edit: true,
        allow_contact_view: true,
        ...updates,
        updated_by: updatedBy || null,
        updated_at: new Date().toISOString(),
      };
      state.accessSettings.push(newSettings);
      persist();
      return newSettings;
    }

    state.accessSettings[idx] = {
      ...state.accessSettings[idx],
      ...updates,
      updated_by: updatedBy || state.accessSettings[idx].updated_by,
      updated_at: new Date().toISOString(),
    };
    persist();
    return state.accessSettings[idx];
  },

  // Academic Records
  getAcademicRecords(menteeId?: string): AcademicRecord[] {
    let records = menteeId 
      ? state.academicRecords.filter(r => r.mentee_id === menteeId)
      : state.academicRecords;

    return records.map(r => ({
      ...r,
      mentee: state.profiles.find(p => p.id === r.mentee_id),
    }));
  },

  createAcademicRecord(record: Omit<AcademicRecord, 'id' | 'created_at' | 'updated_at'>): AcademicRecord {
    const id = `acad-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    // Auto-compute total and status if appropriate
    const internal = record.internal_marks ?? 0;
    const external = record.external_marks ?? 0;
    const total = (record.internal_marks != null && record.external_marks != null) 
      ? internal + external 
      : (record.total_marks ?? null);

    let resultStatus: ResultStatus = record.result_status || 'PENDING';
    if (total != null && record.maximum_marks) {
      const pct = (total / record.maximum_marks) * 100;
      if (pct >= 40) {
        resultStatus = 'PASS';
      } else {
        resultStatus = 'FAIL';
      }
    }

    const newRecord: AcademicRecord = {
      ...record,
      id,
      total_marks: total,
      result_status: resultStatus,
      verified_by: record.verified_by || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    state.academicRecords.push(newRecord);
    persist();
    return {
      ...newRecord,
      mentee: state.profiles.find(p => p.id === newRecord.mentee_id),
    };
  },

  updateAcademicRecord(id: string, updates: Partial<AcademicRecord>, actorId?: string): AcademicRecord {
    const idx = state.academicRecords.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Academic record not found');

    const existing = state.academicRecords[idx];
    const actor = actorId ? state.profiles.find(p => p.id === actorId) : null;
    const isAdmin = actor?.role === 'admin' || actorId === INITIAL_ADMIN_ID;

    // Academic Data Guard (mirroring PostgreSQL protect_academic_records trigger)
    if (!isAdmin) {
      if (existing.verification_status === 'verified') {
        throw new Error('Verified academic records cannot be altered by mentees or mentors.');
      }
      if (updates.verification_status && updates.verification_status === 'verified') {
        throw new Error('Only administrators can verify academic records.');
      }
    }

    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Recompute total if marks changed
    if (updated.internal_marks != null && updated.external_marks != null) {
      updated.total_marks = Number(updated.internal_marks) + Number(updated.external_marks);
      const pct = (updated.total_marks / updated.maximum_marks) * 100;
      updated.result_status = pct >= 40 ? 'PASS' : 'FAIL';
    }

    state.academicRecords[idx] = updated;
    persist();
    return {
      ...updated,
      mentee: state.profiles.find(p => p.id === updated.mentee_id),
    };
  },

  verifyAcademicRecord(id: string, status: VerificationStatus, verifiedBy: string): AcademicRecord {
    return this.updateAcademicRecord(id, {
      verification_status: status,
      verified_by: verifiedBy,
    }, verifiedBy);
  },

  deleteAcademicRecord(id: string): void {
    state.academicRecords = state.academicRecords.filter(r => r.id !== id);
    persist();
  },

  // Recommendations
  getRecommendations(filter?: { menteeId?: string; mentorId?: string }): Recommendation[] {
    let recs = state.recommendations;
    if (filter?.menteeId) {
      recs = recs.filter(r => r.mentee_id === filter.menteeId);
    }
    if (filter?.mentorId) {
      recs = recs.filter(r => r.mentor_id === filter.mentorId);
    }

    return recs.map(r => ({
      ...r,
      mentor: state.profiles.find(p => p.id === r.mentor_id),
      mentee: state.profiles.find(p => p.id === r.mentee_id),
    }));
  },

  createRecommendation(rec: Omit<Recommendation, 'id' | 'created_at' | 'updated_at' | 'is_viewed' | 'viewed_at'>): Recommendation {
    const id = `rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newRec: Recommendation = {
      ...rec,
      id,
      is_viewed: false,
      viewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.recommendations.unshift(newRec);
    persist();
    return {
      ...newRec,
      mentor: state.profiles.find(p => p.id === newRec.mentor_id),
      mentee: state.profiles.find(p => p.id === newRec.mentee_id),
    };
  },

  updateRecommendation(id: string, updates: Partial<Recommendation>): Recommendation {
    const idx = state.recommendations.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Recommendation not found');

    state.recommendations[idx] = {
      ...state.recommendations[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    persist();
    return {
      ...state.recommendations[idx],
      mentor: state.profiles.find(p => p.id === state.recommendations[idx].mentor_id),
      mentee: state.profiles.find(p => p.id === state.recommendations[idx].mentee_id),
    };
  },

  deleteRecommendation(id: string): void {
    state.recommendations = state.recommendations.filter(r => r.id !== id);
    persist();
  },

  markRecommendationViewed(recommendationId: string, menteeId: string): Recommendation {
    const rec = state.recommendations.find(r => r.id === recommendationId && r.mentee_id === menteeId);
    if (!rec) throw new Error('Recommendation not found');

    rec.is_viewed = true;
    rec.viewed_at = new Date().toISOString();
    persist();
    return {
      ...rec,
      mentor: state.profiles.find(p => p.id === rec.mentor_id),
      mentee: state.profiles.find(p => p.id === rec.mentee_id),
    };
  },

  // Mentor Notes (Private)
  getMentorNotes(mentorId: string, menteeId?: string): MentorNote[] {
    let notes = state.mentorNotes.filter(n => n.mentor_id === mentorId);
    if (menteeId) {
      notes = notes.filter(n => n.mentee_id === menteeId);
    }
    return notes;
  },

  createMentorNote(note: Omit<MentorNote, 'id' | 'created_at' | 'updated_at'>): MentorNote {
    const id = `note-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newNote: MentorNote = {
      ...note,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.mentorNotes.unshift(newNote);
    persist();
    return newNote;
  },

  deleteMentorNote(id: string): void {
    state.mentorNotes = state.mentorNotes.filter(n => n.id !== id);
    persist();
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return state.auditLogs
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(log => ({
        ...log,
        actor: log.actor_id ? state.profiles.find(p => p.id === log.actor_id) : undefined,
      }));
  },

  logAction(actorId: string | null, action: string, targetType: string, targetId?: string, details: Record<string, any> = {}): AuditLog {
    const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const log: AuditLog = {
      id,
      actor_id: actorId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      created_at: new Date().toISOString(),
    };
    state.auditLogs.unshift(log);
    // Keep last 200 logs
    if (state.auditLogs.length > 200) {
      state.auditLogs = state.auditLogs.slice(0, 200);
    }
    persist();
    return log;
  },
};
