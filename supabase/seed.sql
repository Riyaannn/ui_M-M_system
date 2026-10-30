-- =========================================================================
-- NMAM Institute of Technology (NMAMIT), Nitte
-- Seed Script: Mentor Anusha and Initial 6 Mentees
-- Safe & Idempotent (runnable multiple times without duplicating accounts)
-- =========================================================================

-- Deterministic UUIDs for demonstration records
DO $$
DECLARE
    v_mentor_anusha_id UUID := '11111111-1111-4111-a111-111111111111';
    v_mentee_1_id UUID := '22222222-2222-4222-a222-222222222201'; -- Riya Ann
    v_mentee_2_id UUID := '22222222-2222-4222-a222-222222222202'; -- Riya Pai
    v_mentee_3_id UUID := '22222222-2222-4222-a222-222222222203'; -- Rohan
    v_mentee_4_id UUID := '22222222-2222-4222-a222-222222222204'; -- Roshwin
    v_mentee_5_id UUID := '22222222-2222-4222-a222-222222222205'; -- Sinchana
    v_mentee_6_id UUID := '22222222-2222-4222-a222-222222222206'; -- Vijeth

    -- Placeholder emails clearly labeled for demonstration/onboarding
    -- Personal details (phone, private email, marks) are NOT invented and left NULL for admin/student entry
    v_anusha_email TEXT := 'anusha.mentor@nmamit.nitte.edu';
    v_mentee_1_email TEXT := 'riya.ann.demo@nmamit.nitte.edu';
    v_mentee_2_email TEXT := 'riya.pai.demo@nmamit.nitte.edu';
    v_mentee_3_email TEXT := 'rohan.demo@nmamit.nitte.edu';
    v_mentee_4_email TEXT := 'roshwin.demo@nmamit.nitte.edu';
    v_mentee_5_email TEXT := 'sinchana.demo@nmamit.nitte.edu';
    v_mentee_6_email TEXT := 'vijeth.demo@nmamit.nitte.edu';
BEGIN
    -- 1. Insert or update Mentor: Anusha in auth.users (if using local Supabase CLI or pg)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES
        ('00000000-0000-0000-0000-000000000000', v_mentor_anusha_id, 'authenticated', 'authenticated', v_anusha_email,
         crypt('NmamitMentor#2026', gen_salt('bf')), now(), now(), now(),
         '{"provider":"email","providers":["email"]}', '{"full_name":"Anusha"}',
         now(), now(), '', '', '', ''),
        ('00000000-0000-0000-0000-000000000000', v_mentee_1_id, 'authenticated', 'authenticated', v_mentee_1_email,
         crypt('NmamitMentee#2026', gen_salt('bf')), now(), now(), now(),
         '{"provider":"email","providers":["email"]}', '{"full_name":"Riya Ann"}',
         now(), now(), '', '', '', ''),
        ('00000000-0000-0000-0000-000000000000', v_mentee_2_id, 'authenticated', 'authenticated', v_mentee_2_email,
         crypt('NmamitMentee#2026', gen_salt('bf')), now(), now(), now(),
         '{"provider":"email","providers":["email"]}', '{"full_name":"Riya Pai"}',
         now(), now(), '', '', '', ''),
        ('00000000-0000-0000-0000-000000000000', v_mentee_3_id, 'authenticated', 'authenticated', v_mentee_3_email,
         crypt('NmamitMentee#2026', gen_salt('bf')), now(), now(), now(),
         '{"provider":"email","providers":["email"]}', '{"full_name":"Rohan"}',
         now(), now(), '', '', '', ''),
        ('00000000-0000-0000-0000-000000000000', v_mentee_4_id, 'authenticated', 'authenticated', v_mentee_4_email,
         crypt('NmamitMentee#2026', gen_salt('bf')), now(), now(), now(),
         '{"provider":"email","providers":["email"]}', '{"full_name":"Roshwin"}',
         now(), now(), '', '', '', ''),
        ('00000000-0000-0000-0000-000000000000', v_mentee_5_id, 'authenticated', 'authenticated', v_mentee_5_email,
         crypt('NmamitMentee#2026', gen_salt('bf')), now(), now(), now(),
         '{"provider":"email","providers":["email"]}', '{"full_name":"Sinchana"}',
         now(), now(), '', '', '', ''),
        ('00000000-0000-0000-0000-000000000000', v_mentee_6_id, 'authenticated', 'authenticated', v_mentee_6_email,
         crypt('NmamitMentee#2026', gen_salt('bf')), now(), now(), now(),
         '{"provider":"email","providers":["email"]}', '{"full_name":"Vijeth"}',
         now(), now(), '', '', '', '')
        ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    END IF;

    -- 2. Upsert Profiles (Mentor Anusha)
    INSERT INTO public.profiles (
        id, full_name, email, phone, role, college, department, branch, semester, mentor_id, is_active
    ) VALUES (
        v_mentor_anusha_id,
        'Anusha',
        v_anusha_email,
        NULL, -- Phone not invented; to be configured by administrator/mentor
        'mentor',
        'NMAM Institute of Technology (NMAMIT), Nitte',
        'Computer Science & Engineering',
        'Faculty / Mentor',
        NULL,
        NULL,
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        college = EXCLUDED.college,
        department = EXCLUDED.department,
        is_active = true;

    -- 3. Upsert Profiles (6 Mentees assigned to Mentor Anusha)
    -- Notice: phone numbers and marks are NOT invented.
    INSERT INTO public.profiles (
        id, full_name, email, phone, role, college, department, branch, semester, mentor_id, is_active
    ) VALUES
    (v_mentee_1_id, 'Riya Ann', v_mentee_1_email, NULL, 'mentee', 'NMAM Institute of Technology (NMAMIT), Nitte', 'Computer Science & Engineering', 'B.Tech - CSE', 5, v_mentor_anusha_id, true),
    (v_mentee_2_id, 'Riya Pai', v_mentee_2_email, NULL, 'mentee', 'NMAM Institute of Technology (NMAMIT), Nitte', 'Computer Science & Engineering', 'B.Tech - CSE', 5, v_mentor_anusha_id, true),
    (v_mentee_3_id, 'Rohan',    v_mentee_3_email, NULL, 'mentee', 'NMAM Institute of Technology (NMAMIT), Nitte', 'Computer Science & Engineering', 'B.Tech - CSE', 5, v_mentor_anusha_id, true),
    (v_mentee_4_id, 'Roshwin',  v_mentee_4_email, NULL, 'mentee', 'NMAM Institute of Technology (NMAMIT), Nitte', 'Computer Science & Engineering', 'B.Tech - CSE', 5, v_mentor_anusha_id, true),
    (v_mentee_5_id, 'Sinchana', v_mentee_5_email, NULL, 'mentee', 'NMAM Institute of Technology (NMAMIT), Nitte', 'Computer Science & Engineering', 'B.Tech - CSE', 5, v_mentor_anusha_id, true),
    (v_mentee_6_id, 'Vijeth',   v_mentee_6_email, NULL, 'mentee', 'NMAM Institute of Technology (NMAMIT), Nitte', 'Computer Science & Engineering', 'B.Tech - CSE', 5, v_mentor_anusha_id, true)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        mentor_id = EXCLUDED.mentor_id,
        role = EXCLUDED.role,
        is_active = true;

    -- 4. Upsert Default Access Settings for the 6 Mentees
    INSERT INTO public.access_settings (
        mentee_id, mentor_id, allow_academic_view, allow_profile_edit, allow_contact_view
    ) VALUES
    (v_mentee_1_id, v_mentor_anusha_id, true, true, true),
    (v_mentee_2_id, v_mentor_anusha_id, true, true, true),
    (v_mentee_3_id, v_mentor_anusha_id, true, true, true),
    (v_mentee_4_id, v_mentor_anusha_id, true, true, true),
    (v_mentee_5_id, v_mentor_anusha_id, true, true, true),
    (v_mentee_6_id, v_mentor_anusha_id, true, true, true)
    ON CONFLICT (mentee_id) DO UPDATE SET
        mentor_id = EXCLUDED.mentor_id,
        allow_academic_view = EXCLUDED.allow_academic_view,
        allow_profile_edit = EXCLUDED.allow_profile_edit,
        allow_contact_view = EXCLUDED.allow_contact_view;

    -- 5. Demonstration Recommendation from Mentor Anusha to Mentees (clearly labeled)
    INSERT INTO public.recommendations (
        mentor_id, mentee_id, title, description, subject, resource_type, resource_url, follow_up_date
    ) VALUES
    (
        v_mentor_anusha_id,
        v_mentee_1_id,
        'Design and Analysis of Algorithms - Reference Material',
        'Review Module 3: Dynamic Programming and Greedy Techniques ahead of next week tutorial.',
        'Algorithms (CS501)',
        'url',
        'https://nptel.ac.in/courses/106102064',
        (CURRENT_DATE + INTERVAL '7 days')
    ),
    (
        v_mentor_anusha_id,
        v_mentee_2_id,
        'Database Management Systems - Query Optimization Notes',
        'Study relational algebra translation and B+ Tree indexing mechanisms.',
        'DBMS (CS502)',
        'url',
        'https://nptel.ac.in/courses/106105175',
        (CURRENT_DATE + INTERVAL '5 days')
    )
    ON CONFLICT DO NOTHING;

    -- 6. Initial Audit Log Entry
    INSERT INTO public.audit_logs (
        actor_id, action, target_type, target_id, details
    ) VALUES (
        v_mentor_anusha_id,
        'SEED_INITIALIZATION',
        'SYSTEM',
        'NMAMIT_INIT',
        jsonb_build_object(
            'message', 'Initial demonstration seed applied for Mentor Anusha and 6 assigned mentees at NMAMIT',
            'mentees_count', 6
        )
    );

END $$;

