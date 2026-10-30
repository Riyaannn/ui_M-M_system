-- NMAM Institute of Technology (NMAMIT), Nitte
-- Mentor-Mentee Management System Schema & Row Level Security Policies

-- Enable pgcrypto / uuid-ossp if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'mentor', 'mentee')),
    college TEXT NOT NULL DEFAULT 'NMAM Institute of Technology (NMAMIT), Nitte',
    department TEXT DEFAULT 'Computer Science & Engineering',
    branch TEXT DEFAULT 'B.Tech - CSE',
    usn TEXT UNIQUE,
    semester INTEGER CHECK (semester BETWEEN 1 AND 8),
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing for high-performance lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_mentor_id ON public.profiles(mentor_id);
CREATE INDEX IF NOT EXISTS idx_profiles_usn ON public.profiles(usn);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. ACCESS SETTINGS TABLE (Administrator-controlled per-mentee privacy and permissions)
CREATE TABLE IF NOT EXISTS public.access_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    allow_academic_view BOOLEAN NOT NULL DEFAULT true,
    allow_profile_edit BOOLEAN NOT NULL DEFAULT true,
    allow_contact_view BOOLEAN NOT NULL DEFAULT true,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_access_settings_mentee_id ON public.access_settings(mentee_id);

-- 3. ACADEMIC RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.academic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
    academic_year TEXT NOT NULL, -- e.g. '2025-2026'
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    credits NUMERIC(3,1) NOT NULL DEFAULT 3.0 CHECK (credits > 0),
    internal_marks NUMERIC(5,2) CHECK (internal_marks >= 0),
    external_marks NUMERIC(5,2) CHECK (external_marks >= 0),
    total_marks NUMERIC(5,2) CHECK (total_marks >= 0),
    maximum_marks NUMERIC(5,2) NOT NULL DEFAULT 100.00 CHECK (maximum_marks > 0),
    grade TEXT,
    result_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (result_status IN ('PASS', 'FAIL', 'PENDING', 'WITHHELD')),
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_academic_records_mentee_sem ON public.academic_records(mentee_id, semester);
CREATE INDEX IF NOT EXISTS idx_academic_records_verification ON public.academic_records(verification_status);

-- 4. MENTOR NOTES TABLE (Private notes & academic observations)
CREATE TABLE IF NOT EXISTS public.mentor_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    note_content TEXT NOT NULL,
    subject TEXT,
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentor_notes_mentee_mentor ON public.mentor_notes(mentee_id, mentor_id);

-- 5. RECOMMENDATIONS TABLE (Learning materials, notes, URLs, PDFs)
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject TEXT NOT NULL,
    resource_type TEXT NOT NULL DEFAULT 'url' CHECK (resource_type IN ('url', 'document', 'note')),
    resource_url TEXT,
    file_path TEXT,
    follow_up_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_mentee_id ON public.recommendations(mentee_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_mentor_id ON public.recommendations(mentor_id);

-- 6. RECOMMENDATION VIEWS TABLE (Tracking read status & timestamps)
CREATE TABLE IF NOT EXISTS public.recommendation_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES public.recommendations(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_mentee_rec_view UNIQUE (recommendation_id, mentee_id)
);

CREATE INDEX IF NOT EXISTS idx_rec_views_rec_id ON public.recommendation_views(recommendation_id);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =========================================================================
-- SECURITY DEFINER HELPER FUNCTIONS (Prevent Infinite Recursion in RLS)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_assigned_mentor_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT mentor_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_mentor(p_mentee_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_mentee_id AND mentor_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.can_mentor_view_academic(p_mentee_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT allow_academic_view FROM public.access_settings WHERE mentee_id = p_mentee_id),
    true
  );
$$;

CREATE OR REPLACE FUNCTION public.can_mentor_view_contact(p_mentee_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT allow_contact_view FROM public.access_settings WHERE mentee_id = p_mentee_id),
    true
  );
$$;

CREATE OR REPLACE FUNCTION public.can_mentee_edit_profile(p_mentee_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT allow_profile_edit FROM public.access_settings WHERE mentee_id = p_mentee_id),
    true
  );
$$;

-- Triggers for privilege protection & data integrity
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF TG_OP = 'UPDATE' THEN
      -- Normal users cannot elevate role, change assignment, or flip activation status
      NEW.role := OLD.role;
      NEW.mentor_id := OLD.mentor_id;
      NEW.is_active := OLD.is_active;
    ELSIF TG_OP = 'INSERT' THEN
      IF NEW.role NOT IN ('mentee') THEN
        NEW.role := 'mentee';
      END IF;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_privileges ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileges
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_privileges();

-- Trigger to prevent unauthorized changes to verified academic records
CREATE OR REPLACE FUNCTION public.protect_academic_record_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NEW.verification_status <> OLD.verification_status AND NEW.verification_status = 'verified' THEN
      RAISE EXCEPTION 'Only administrators can verify academic records.';
    END IF;
    IF OLD.verification_status = 'verified' THEN
      RAISE EXCEPTION 'Verified academic records cannot be altered by mentees or mentors.';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_academic_records ON public.academic_records;
CREATE TRIGGER trg_protect_academic_records
BEFORE UPDATE ON public.academic_records
FOR EACH ROW
EXECUTE FUNCTION public.protect_academic_record_changes();

-- =========================================================================
-- ROW LEVEL SECURITY POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT
USING (
    public.is_admin()
    OR id = auth.uid()
    OR mentor_id = auth.uid()
    OR id = public.get_assigned_mentor_id()
);

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT
WITH CHECK (
    public.is_admin()
    OR id = auth.uid()
);

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE
USING (
    public.is_admin()
    OR (id = auth.uid() AND public.can_mentee_edit_profile(auth.uid()))
)
WITH CHECK (
    public.is_admin()
    OR (id = auth.uid() AND public.can_mentee_edit_profile(auth.uid()))
);

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE
USING (public.is_admin());

-- 2. ACCESS SETTINGS POLICIES
DROP POLICY IF EXISTS "access_settings_select_policy" ON public.access_settings;
CREATE POLICY "access_settings_select_policy" ON public.access_settings
FOR SELECT
USING (
    public.is_admin()
    OR mentee_id = auth.uid()
    OR public.is_assigned_mentor(mentee_id)
);

DROP POLICY IF EXISTS "access_settings_admin_all" ON public.access_settings;
CREATE POLICY "access_settings_admin_all" ON public.access_settings
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. ACADEMIC RECORDS POLICIES
DROP POLICY IF EXISTS "academic_records_select_policy" ON public.academic_records;
CREATE POLICY "academic_records_select_policy" ON public.academic_records
FOR SELECT
USING (
    public.is_admin()
    OR mentee_id = auth.uid()
    OR (public.is_assigned_mentor(mentee_id) AND public.can_mentor_view_academic(mentee_id))
);

DROP POLICY IF EXISTS "academic_records_insert_policy" ON public.academic_records;
CREATE POLICY "academic_records_insert_policy" ON public.academic_records
FOR INSERT
WITH CHECK (
    public.is_admin()
    OR (mentee_id = auth.uid() AND verification_status = 'pending')
);

DROP POLICY IF EXISTS "academic_records_update_policy" ON public.academic_records;
CREATE POLICY "academic_records_update_policy" ON public.academic_records
FOR UPDATE
USING (
    public.is_admin()
    OR (mentee_id = auth.uid() AND verification_status = 'pending')
)
WITH CHECK (
    public.is_admin()
    OR (mentee_id = auth.uid() AND verification_status = 'pending')
);

DROP POLICY IF EXISTS "academic_records_delete_policy" ON public.academic_records;
CREATE POLICY "academic_records_delete_policy" ON public.academic_records
FOR DELETE
USING (
    public.is_admin()
    OR (mentee_id = auth.uid() AND verification_status = 'pending')
);

-- 4. MENTOR NOTES POLICIES (Private to mentor & admins)
DROP POLICY IF EXISTS "mentor_notes_select_policy" ON public.mentor_notes;
CREATE POLICY "mentor_notes_select_policy" ON public.mentor_notes
FOR SELECT
USING (
    public.is_admin()
    OR mentor_id = auth.uid()
);

DROP POLICY IF EXISTS "mentor_notes_insert_policy" ON public.mentor_notes;
CREATE POLICY "mentor_notes_insert_policy" ON public.mentor_notes
FOR INSERT
WITH CHECK (
    public.is_admin()
    OR (mentor_id = auth.uid() AND public.is_assigned_mentor(mentee_id))
);

DROP POLICY IF EXISTS "mentor_notes_update_policy" ON public.mentor_notes;
CREATE POLICY "mentor_notes_update_policy" ON public.mentor_notes
FOR UPDATE
USING (
    public.is_admin()
    OR mentor_id = auth.uid()
);

DROP POLICY IF EXISTS "mentor_notes_delete_policy" ON public.mentor_notes;
CREATE POLICY "mentor_notes_delete_policy" ON public.mentor_notes
FOR DELETE
USING (
    public.is_admin()
    OR mentor_id = auth.uid()
);

-- 5. RECOMMENDATIONS POLICIES
DROP POLICY IF EXISTS "recommendations_select_policy" ON public.recommendations;
CREATE POLICY "recommendations_select_policy" ON public.recommendations
FOR SELECT
USING (
    public.is_admin()
    OR mentor_id = auth.uid()
    OR mentee_id = auth.uid()
);

DROP POLICY IF EXISTS "recommendations_insert_policy" ON public.recommendations;
CREATE POLICY "recommendations_insert_policy" ON public.recommendations
FOR INSERT
WITH CHECK (
    public.is_admin()
    OR (mentor_id = auth.uid() AND public.is_assigned_mentor(mentee_id))
);

DROP POLICY IF EXISTS "recommendations_update_policy" ON public.recommendations;
CREATE POLICY "recommendations_update_policy" ON public.recommendations
FOR UPDATE
USING (
    public.is_admin()
    OR mentor_id = auth.uid()
);

DROP POLICY IF EXISTS "recommendations_delete_policy" ON public.recommendations;
CREATE POLICY "recommendations_delete_policy" ON public.recommendations
FOR DELETE
USING (
    public.is_admin()
    OR mentor_id = auth.uid()
);

-- 6. RECOMMENDATION VIEWS POLICIES
DROP POLICY IF EXISTS "rec_views_select_policy" ON public.recommendation_views;
CREATE POLICY "rec_views_select_policy" ON public.recommendation_views
FOR SELECT
USING (
    public.is_admin()
    OR mentee_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.recommendations r
        WHERE r.id = recommendation_id AND r.mentor_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "rec_views_insert_policy" ON public.recommendation_views;
CREATE POLICY "rec_views_insert_policy" ON public.recommendation_views
FOR INSERT
WITH CHECK (
    mentee_id = auth.uid()
    OR public.is_admin()
);

-- 7. AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "audit_logs_admin_select" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_select" ON public.audit_logs
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_insert" ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Deny UPDATE and DELETE on audit logs for immutability
-- (no policy for update or delete means access is denied by default under RLS)

-- =========================================================================
-- STORAGE BUCKET CONFIGURATION FOR STUDY MATERIALS
-- =========================================================================

-- In Supabase Storage, create private bucket 'study-materials'
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS:
DROP POLICY IF EXISTS "Allow authenticated read for authorized participants" ON storage.objects;
CREATE POLICY "Allow authenticated read for authorized participants" ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'study-materials'
    AND (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.recommendations r
            WHERE r.file_path = name
              AND (r.mentor_id = auth.uid() OR r.mentee_id = auth.uid())
        )
    )
);

DROP POLICY IF EXISTS "Allow mentors and admin to upload materials" ON storage.objects;
CREATE POLICY "Allow mentors and admin to upload materials" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'study-materials'
    AND (public.is_admin() OR public.get_auth_role() = 'mentor')
);

