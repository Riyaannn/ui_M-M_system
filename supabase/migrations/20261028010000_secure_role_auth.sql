-- =========================================================================
-- NMAMIT Mentor-Mentee Management System
-- Migration: Enhanced Role-Based Authentication & Account Isolation
-- =========================================================================

-- 1. Helper function to check if active user has a specific trusted role
CREATE OR REPLACE FUNCTION public.check_user_is_role(expected_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND role = expected_role 
      AND is_active = true
  );
$$;

-- 2. Helper function to return the trusted profile of the current user
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    role TEXT,
    college TEXT,
    department TEXT,
    branch TEXT,
    usn TEXT,
    semester INTEGER,
    mentor_id UUID,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.full_name,
    p.email,
    p.phone,
    p.role,
    p.college,
    p.department,
    p.branch,
    p.usn,
    p.semester,
    p.mentor_id,
    p.is_active,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = auth.uid() AND p.is_active = true;
$$;

-- 3. Bootstrap Administrator Function
-- Allows safe initialization of the first administrator account if no admin exists
CREATE OR REPLACE FUNCTION public.bootstrap_initial_admin(
    admin_user_id UUID,
    admin_email TEXT,
    admin_full_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only allow if no active admin currently exists, or if called by an existing admin
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin' AND is_active = true) OR public.is_admin() THEN
        INSERT INTO public.profiles (
            id, full_name, email, role, college, department, branch, is_active
        ) VALUES (
            admin_user_id,
            admin_full_name,
            admin_email,
            'admin',
            'NMAM Institute of Technology (NMAMIT), Nitte',
            'Academic Administration',
            'Dean Academics Office',
            true
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            is_active = true,
            updated_at = now();

        -- Audit log entry
        INSERT INTO public.audit_logs (
            actor_id, action, target_type, target_id, details
        ) VALUES (
            admin_user_id,
            'ADMIN_BOOTSTRAP',
            'PROFILE',
            admin_user_id::text,
            jsonb_build_object(
                'email', admin_email,
                'message', 'Initial administrator provisioned successfully'
            )
        );
    ELSE
        RAISE EXCEPTION 'An active administrator already exists in the system.';
    END IF;
END;
$$;

-- 4. Update profiles policy to strictly require is_active = true
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT
USING (
    -- Admin can read all active and inactive accounts
    public.is_admin()
    -- An active user can read their own profile
    OR (id = auth.uid() AND is_active = true)
    -- An active mentor can read assigned active mentees
    OR (mentor_id = auth.uid() AND public.check_user_is_role('mentor'))
    -- An active mentee can read their assigned mentor's profile
    OR (id = public.get_assigned_mentor_id() AND public.check_user_is_role('mentee'))
);

-- 5. Revoke direct execute grants from public on administrative bootstrap
REVOKE EXECUTE ON FUNCTION public.bootstrap_initial_admin FROM public;
GRANT EXECUTE ON FUNCTION public.bootstrap_initial_admin TO service_role;
GRANT EXECUTE ON FUNCTION public.check_user_is_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_profile TO authenticated;

