# NMAMIT Mentor–Mentee Management System

**An Enterprise-Grade, Production-Style Web Portal for NMAM Institute of Technology (NMAMIT), Nitte**

---

## 1. Project Overview & Institutional Architecture

The **NMAMIT Mentor–Mentee Management System** is a full-stack, secure, role-based platform designed specifically for **NMAM Institute of Technology (NMAMIT), Nitte** (An Autonomous Institution affiliated with Nitte Deemed to be University). 

The system automates and supervises undergraduate student mentoring across the institution:
- **Demonstration Mentor:** Anusha (Faculty Mentor, Computer Science & Engineering)
- **Initial 6 Demonstration Mentees:**
  1. Riya Ann
  2. Riya Pai
  3. Rohan
  4. Roshwin
  5. Sinchana
  6. Vijeth
- All 6 initial mentees are pre-assigned to Mentor **Anusha**.
- **Privacy & Integrity Standard:** Personal telephone numbers, private email addresses, and marks are **not** invented or hallucinated; placeholder and empty states are provided so students and administrators enter verified information.
- **Academic Verification Principle:** Mentees may submit draft marks from semester examinations; these are marked as `pending` verification and cannot be altered once an authorized administrator audits, verifies, and publishes them.

---

## 2. Technology Stack

- **Frontend:** React 18 with Vite 6
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS (Navy Blue `#0f2438`, `#0a1724`, clean whites, and subtle teal `#0d9488` accents)
- **Icons:** Lucide React
- **Routing:** React Router v6 with Role-Based Protected Routes
- **Form Management & Validation:** React Hook Form and Zod schemas
- **Database & Storage:** Supabase PostgreSQL with Row Level Security (RLS) and Private Storage Buckets
- **Authentication:** Supabase Auth (Email & Password + Password Recovery)
- **Visualizations:** Recharts (Marks breakdown and academic progress)
- **Testing:** Vitest 3, React Testing Library, and JSDOM

---

## 3. Project Structure

```text
ui_project/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── .gitignore
├── supabase/
│   ├── migrations/
│   │   └── 20261028000000_initial_schema.sql  # Complete schema, functions, triggers & RLS policies
│   └── seed.sql                               # Safe, idempotent seed script (Anusha & 6 mentees)
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── types/
    │   └── index.ts                           # Comprehensive TypeScript data interfaces
    ├── lib/
    │   ├── supabase.ts                        # Centralized Supabase client with smart fallback
    │   ├── mockData.ts                        # Initial demonstration data for NMAMIT
    │   └── validation.ts                      # Zod validation schemas
    ├── contexts/
    │   ├── AuthContext.tsx                    # Multi-role authentication & session state
    │   └── ToastContext.tsx                   # Toast notification system
    ├── services/
    │   ├── dbStore.ts                         # Reactive data layer & audit trail engine
    │   ├── authService.ts                     # Auth flows & password recovery
    │   ├── profileService.ts                  # Profile CRUD, mentor assignment & active toggles
    │   ├── academicService.ts                 # Academic records & SGPA/percentage calculations
    │   ├── recommendationService.ts           # Study resources, PDF uploads & view tracking
    │   ├── notesService.ts                    # Confidential mentor observations
    │   └── adminService.ts                    # Admin stats, privacy governance & CSV export
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Modal.tsx
    │   │   ├── ConfirmDialog.tsx
    │   │   ├── StatCard.tsx
    │   │   ├── EmptyState.tsx
    │   │   └── LoadingSpinner.tsx
    │   └── layout/
    │       ├── Header.tsx                     # Header with NMAMIT branding & 1-click Role Switcher
    │       ├── Sidebar.tsx                    # Role-specific navigation sidebar
    │       └── DashboardLayout.tsx
    ├── routes/
    │   └── ProtectedRoute.tsx                 # Strict role-based route guard
    ├── pages/
    │   ├── auth/
    │   │   ├── LoginPage.tsx                  # Email/password login with demo shortcuts
    │   │   ├── ForgotPasswordPage.tsx         # Password reset dispatch
    │   │   ├── UnauthorizedPage.tsx           # 403 Forbidden handler
    │   │   └── NotFoundPage.tsx               # 404 Not Found handler
    │   ├── admin/
    │   │   ├── AdminDashboardPage.tsx         # Executive metrics & audit feed
    │   │   ├── AdminMentorsPage.tsx           # Faculty mentor administration
    │   │   ├── AdminMenteesPage.tsx           # Student directory & CSV export
    │   │   ├── AdminMenteeProfilePage.tsx     # Student dossier & marks publisher
    │   │   ├── AdminAssignmentsPage.tsx       # Mentoring cohort allocation
    │   │   ├── AdminVerificationsPage.tsx     # Marks audit & verification console
    │   │   ├── AdminPermissionsPage.tsx       # Per-student privacy matrix
    │   │   └── AdminAuditLogsPage.tsx         # Immutable security trail
    │   ├── mentor/
    │   │   ├── MentorDashboardPage.tsx        # Faculty overview & quick actions
    │   │   ├── MentorMenteesPage.tsx          # Assigned cohort directory with contact links
    │   │   ├── MentorMenteeDetailPage.tsx     # Dossier, marks chart & private observations
    │   │   ├── MentorRecommendationsPage.tsx  # Learning material publisher & view tracker
    │   │   └── MentorNotesPage.tsx            # Private counseling logs
    │   └── mentee/
    │       ├── MenteeDashboardPage.tsx        # Semester progress, mentor & recommendation alerts
    │       ├── MenteeProfilePage.tsx          # Demographic editor (subject to admin lock)
    │       ├── MenteeAcademicRecordsPage.tsx  # Marks view, SGPA & examination draft submissions
    │       ├── MenteeMentorPage.tsx           # Mentor contact information & office hours
    │       └── MenteeRecommendationsPage.tsx  # Study resource reader & "Mark as Read" action
    └── test/
        ├── setup.ts
        ├── auth.test.ts                       # Unit tests for session & login
        ├── security_rls.test.ts               # Unit tests for access control & verified lock
        ├── academic_calculations.test.ts      # Unit tests for SGPA & percentage
        └── components.test.tsx                # Unit tests for badges and UI components
```

---

## 4. Database Schema & Row Level Security (RLS)

All database entities are fully defined in `supabase/migrations/20261028000000_initial_schema.sql`.

### Relational Tables:
1. `profiles`:
   - `id` (UUID references `auth.users`)
   - `full_name`, `email`, `phone`
   - `role` (`'admin' | 'mentor' | 'mentee'`)
   - `college`, `department`, `branch`, `usn`, `semester`
   - `mentor_id` (UUID references `profiles.id`)
   - `is_active` (boolean default true)
   - `created_at`, `updated_at`
2. `access_settings`:
   - `mentee_id`, `mentor_id`
   - `allow_academic_view` (controls mentor visibility)
   - `allow_profile_edit` (controls student self-editing)
   - `allow_contact_view` (controls phone/email disclosure)
3. `academic_records`:
   - `mentee_id`, `semester`, `academic_year`, `subject_code`, `subject_name`, `credits`
   - `internal_marks`, `external_marks`, `total_marks`, `maximum_marks`, `grade`
   - `result_status` (`'PASS' | 'FAIL' | 'PENDING' | 'WITHHELD'`)
   - `verification_status` (`'pending' | 'verified' | 'rejected'`)
   - `verified_by`, `submitted_by`
4. `mentor_notes`:
   - `mentor_id`, `mentee_id`, `title`, `note_content`, `subject`, `visibility`
   - Confidential observations strictly visible to faculty mentor & admins.
5. `recommendations`:
   - `mentor_id`, `mentee_id`, `title`, `description`, `subject`, `resource_type`, `resource_url`, `file_path`, `follow_up_date`
6. `recommendation_views`:
   - `recommendation_id`, `mentee_id`, `viewed_at`
   - Tracks when a student accesses a recommendation.
7. `audit_logs`:
   - Immutable security table recording `actor_id`, `action`, `target_type`, `target_id`, `details`, `created_at`.
8. `storage.buckets`:
   - Private bucket `study-materials` with signed URL access.

### Recursive RLS Prevention:
To prevent PostgreSQL infinite recursion loops when querying `profiles` within policies on `profiles`, the schema employs `SECURITY DEFINER` helper functions with a fixed search path (`SET search_path = public`):
- `public.get_auth_role()`
- `public.is_admin()`
- `public.get_assigned_mentor_id()`
- `public.is_assigned_mentor(p_mentee_id uuid)`
- `public.can_mentor_view_academic(p_mentee_id uuid)`
- `public.can_mentor_view_contact(p_mentee_id uuid)`
- `public.can_mentee_edit_profile(p_mentee_id uuid)`

Triggers enforce that:
- Non-administrators cannot escalate their role or flip `is_active`.
- Verified academic records cannot be altered by students or mentors.

---

## 5. Step-by-Step Setup & Deployment Instructions

### Prerequisites
- Node.js (v18 or higher; v24 recommended)
- npm or pnpm
- A Supabase account (free tier works)

---

### Step 1: Install Dependencies
```bash
npm install
```

---

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your Supabase Project URL and Public Anon Key:
```env
VITE_SUPABASE_URL=https://<your-supabase-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```
*(Note: If no Supabase credentials are provided initially, the application automatically loads in zero-configuration Demonstration Mode with Anusha and the 6 mentees pre-seeded).*

---

### Step 3: Apply Database Migrations in Supabase
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Open and copy the contents of `supabase/migrations/20261028000000_initial_schema.sql`.
3. Run the script. This creates:
   - All relational tables
   - Foreign key constraints & performance indexes
   - Triggers for privilege protection & verified marks lock
   - Security Definer helper functions
   - Row Level Security (RLS) policies
   - The private `study-materials` storage bucket

---

### Step 4: Run the Idempotent Seed Script
In the Supabase **SQL Editor**:
1. Copy the contents of `supabase/seed.sql`.
2. Run the script.
3. This creates:
   - Mentor **Anusha** (`anusha.mentor@nmamit.nitte.edu`)
   - Initial 6 Mentees: **Riya Ann**, **Riya Pai**, **Rohan**, **Roshwin**, **Sinchana**, **Vijeth**
   - Assigns all 6 mentees to Mentor Anusha
   - Sets up default access permissions
   - Inserts initial demonstration study recommendations

---

### Step 5: Launch Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

### Step 6: Run Automated Tests
```bash
npm run test
```
All 17 tests verify:
- Authentication and session states
- Role-based route guards
- Immutability of verified marks
- Mentor cohort isolation
- Recommendation read-status logging
- Academic SGPA & credit calculations

---

### Step 7: Build for Production
```bash
npm run build
```
Creates an optimized static bundle in `dist/`.

---

### Step 8: Deploy Frontend to Vercel
1. Push your repository to GitHub / GitLab.
2. In the **Vercel Dashboard**, click **Add New Project** and select the repository.
3. Set the Framework Preset to **Vite**.
4. Add the Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**.
6. In **Supabase Dashboard** -> **Authentication** -> **URL Configuration**, add your Vercel production domain to **Redirect URLs** (e.g., `https://your-app.vercel.app/**`).

---

## 6. Demonstration Accounts & Evaluation Matrix

For seamless evaluation, the login page features **1-Click Demo Logins** and a persistent **Role Switcher** in the navigation header:

| Role | Name | Email | Initial Status |
| :--- | :--- | :--- | :--- |
| **Administrator** | System Administrator | `admin@nmamit.nitte.edu` | Full institutional oversight |
| **Mentor** | Anusha | `anusha.mentor@nmamit.nitte.edu` | Supervised cohort of 6 mentees |
| **Mentee 1** | Riya Ann | `riya.ann.demo@nmamit.nitte.edu` | Sem 5 &bull; Assigned to Anusha |
| **Mentee 2** | Riya Pai | `riya.pai.demo@nmamit.nitte.edu` | Sem 5 &bull; Assigned to Anusha |
| **Mentee 3** | Rohan | `rohan.demo@nmamit.nitte.edu` | Sem 5 &bull; Assigned to Anusha |
| **Mentee 4** | Roshwin | `roshwin.demo@nmamit.nitte.edu` | Sem 5 &bull; Assigned to Anusha |
| **Mentee 5** | Sinchana | `sinchana.demo@nmamit.nitte.edu` | Sem 5 &bull; Assigned to Anusha |
| **Mentee 6** | Vijeth | `vijeth.demo@nmamit.nitte.edu` | Sem 5 &bull; Assigned to Anusha |

---

## 7. Quality Assurance & Manual Testing Checklist

### 1. Administrator Workflow Checklist
- [x] Sign in as Administrator (`admin@nmamit.nitte.edu`).
- [x] Verify Dashboard shows 6 Mentees, 1 Mentor (Anusha), pending marks, and live audit feed.
- [x] Go to **Manage Mentees** and click **Export CSV**; verify CSV file is downloaded.
- [x] Open **Mentor Assignment**; reassign a student to another faculty mentor or unassign.
- [x] Navigate to **Marks Verification**; view draft scores submitted by students and click **Verify & Publish**.
- [x] Navigate to **Access Permissions**; toggle "Mentee Profile Edit" or "Mentor Academic View" for a student and verify that permissions update instantly.

### 2. Mentor (Anusha) Workflow Checklist
- [x] Sign in as Mentor **Anusha**.
- [x] Verify you only see your 6 assigned mentees (Riya Ann, Riya Pai, Rohan, Roshwin, Sinchana, Vijeth).
- [x] Click on a mentee (e.g. Riya Ann) to open their academic dossier.
- [x] Verify the performance chart and marks breakdown.
- [x] Click **Add Private Observation** and save a confidential note; confirm it appears only on your screen.
- [x] Click **Recommend Study Notes**; enter title, subject, and resource URL.
- [x] Open **Recommendations** tab; verify you can track whether the mentee has viewed the recommendation.

### 3. Mentee Workflow Checklist
- [x] Sign in as Mentee (e.g. **Riya Ann** or **Riya Pai**).
- [x] Verify your dashboard shows profile completion % and assigned mentor **Anusha**.
- [x] Click **My Mentor**; test direct `mailto:` link, phone link, and WhatsApp link.
- [x] Go to **Recommended Notes**; open the study resource and click **Mark as Read**.
- [x] Go to **Academic Records**; click **Submit Examination Marks** to enter CIE/SEE draft scores.
- [x] Confirm the submitted score is tagged as **Pending Verification** and cannot alter verified results.
- [x] Attempt to navigate directly to `/admin/dashboard` in the URL; verify you are redirected to `/unauthorized` with a 403 Forbidden alert.

---

## 8. Institutional Compliance

Developed in alignment with the academic regulations of **NMAM Institute of Technology (NMAMIT), Nitte**, ensuring secure student mentoring, academic integrity, and strict separation of faculty and administrative privileges.
