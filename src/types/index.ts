export type UserRole = 'admin' | 'mentor' | 'mentee';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  college: string;
  department?: string | null;
  branch?: string | null;
  usn?: string | null;
  semester?: number | null;
  mentor_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  mentor?: UserProfile | null;
}

export type AdminProfile = UserProfile & { role: 'admin' };
export type MentorProfile = UserProfile & { role: 'mentor' };
export type MenteeProfile = UserProfile & { role: 'mentee' };

export interface AccessSettings {
  id: string;
  mentee_id: string;
  mentor_id?: string | null;
  allow_academic_view: boolean;
  allow_profile_edit: boolean;
  allow_contact_view: boolean;
  updated_by?: string | null;
  updated_at: string;
}

export type ResultStatus = 'PASS' | 'FAIL' | 'PENDING' | 'WITHHELD';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface AcademicRecord {
  id: string;
  mentee_id: string;
  semester: number;
  academic_year: string;
  subject_code: string;
  subject_name: string;
  credits: number;
  internal_marks?: number | null;
  external_marks?: number | null;
  total_marks?: number | null;
  maximum_marks: number;
  grade?: string | null;
  result_status: ResultStatus;
  verification_status: VerificationStatus;
  verified_by?: string | null;
  submitted_by?: string | null;
  created_at: string;
  updated_at: string;
  mentee?: UserProfile;
}

export interface MentorNote {
  id: string;
  mentor_id: string;
  mentee_id: string;
  title: string;
  note_content: string;
  subject?: string | null;
  visibility: 'private' | 'shared';
  created_at: string;
  updated_at: string;
}

export type ResourceType = 'url' | 'document' | 'note';

export interface Recommendation {
  id: string;
  mentor_id: string;
  mentee_id: string;
  title: string;
  description: string;
  subject: string;
  resource_type: ResourceType;
  resource_url?: string | null;
  file_path?: string | null;
  follow_up_date?: string | null;
  created_at: string;
  updated_at: string;
  mentor?: UserProfile;
  mentee?: UserProfile;
  views?: RecommendationView[];
  is_viewed?: boolean;
  viewed_at?: string | null;
}

export interface RecommendationView {
  id: string;
  recommendation_id: string;
  mentee_id: string;
  viewed_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  action: string;
  target_type: string;
  target_id?: string | null;
  details: Record<string, any>;
  created_at: string;
  actor?: UserProfile;
}

export interface SemesterSummary {
  semester: number;
  academic_year: string;
  totalSubjects: number;
  passedSubjects: number;
  failedSubjects: number;
  pendingSubjects: number;
  totalCredits: number;
  totalObtainedMarks: number;
  totalMaxMarks: number;
  percentage?: number | null;
  sgpa?: number | null;
  status: 'PENDING' | 'PASS' | 'FAIL';
}

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export type AuthState =
  | { status: 'loading'; user: null; profile: null; role: null }
  | { status: 'unauthenticated'; user: null; profile: null; role: null }
  | { status: 'authenticated'; user: { id: string; email: string }; profile: UserProfile; role: UserRole };
