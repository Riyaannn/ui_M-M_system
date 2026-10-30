# M&M — Mentor & Mentee Management System

**An Art-Directed, Premium Dark SaaS Platform for NMAM Institute of Technology (NMAMIT), Nitte**

> *"Your academic journey, with the right guidance."*  
> *Subtitle: "Mentoring, thoughtfully designed"*

---

## 1. Brand Identity & Institutional Framework

**M&M** (*Mentor & Mentee*) is an enterprise-grade, full-stack mentoring platform crafted specifically for **NMAM Institute of Technology (NMAMIT), Nitte** (An Autonomous Institution affiliated with Nitte Deemed to be University).

- **Brand Wordmark:** **M&M**
- **Brand Personality:** Premium, modern, calm, intelligent, personal, and academically focused. Visually distinct from generic administrative templates.
- **Institutional Context:** "NMAMIT, Nitte" serves as the secondary institutional identifier across the navigation sidebar, footer, and dossier badges.
- **Demonstration Faculty Mentor:** **Anusha** (Department of Computer Science & Engineering)
- **Initial 6 Demonstration Mentees:**
  1. **Riya Ann**
  2. **Riya Pai**
  3. **Rohan**
  4. **Roshwin**
  5. **Sinchana**
  6. **Vijeth**
- All 6 students are pre-assigned to Mentor **Anusha**.
- **Privacy & Integrity Standard:** Personal telephone numbers, private email addresses, and marks are **never** fabricated. Empty and placeholder states prompt verified administrative entry.
- **Academic Verification Principle:** Students submit draft marks; they remain `pending` verification until audited, verified, and published by an administrator, after which they are permanently locked against student and mentor modifications.

---

## 2. Visual Design System & Design Tokens

M&M is built from the ground up with a dark charcoal and deep-purple visual theme:

| Token / Concept | Value / Hex Code | Usage |
| :--- | :--- | :--- |
| **Main Background** | `#0D0B12` | Root application background with subtle ambient grid (`mm-grid-pattern`) |
| **Secondary Background**| `#12101A` | Navigation headers, filter trays, table headers |
| **Sidebar Background** | `#100D17` | Left application navigation drawer |
| **Card Background** | `#191521` | Elevated container surfaces |
| **Elevated Surface** | `#211A2D` | Hover states, modals, and featured cards |
| **Fine Border** | `#30263E` | Crisp, visible card and input borders |
| **Subtle Border** | `#251E31` | Dividers, scrollbar thumbs, and inner dividers |
| **Primary Violet** | `#8B5CF6` | Brand action buttons, active navigation indicators, key highlights |
| **Bright Violet** | `#A78BFA` | Contrast accents, badges, and focus rings |
| **Soft Lavender** | `#C4B5FD` | Active badge text and typography highlights |
| **Main Text** | `#F5F3FA` | High-contrast body, editorial headings |
| **Secondary Text** | `#AAA2B8` | Subtitles, labels, and helper descriptions |
| **Muted Text** | `#777084` | Meta timestamps, placeholder values, and borders |
| **Success Emerald** | `#4ADEA8` | Verified marks, active accounts, read status |
| **Warning Amber** | `#FBBF74` | Pending verification, unread recommendations |
| **Error Rose** | `#FB7185` | Deactivated accounts, failed marks, access restrictions |

---

## 3. Dedicated Login Experiences & Role Architecture

M&M guarantees role isolation through three distinct login portals and an editorial directory:

| Route | Portal Name | Intended Role | Description |
| :--- | :--- | :--- | :--- |
| `/login` | **Portal Directory** | Public Entry | Two-part composition: Brand statement & features on left; 3 distinct portal choices on right. |
| `/admin/login` | **Administration Portal** | `admin` | Executive institutional oversight, marks publication, mentor assignments, and access matrix. |
| `/mentor/login` | **Mentor Portal** | `mentor` | Supervised cohort view for Mentor Anusha, student dossiers, study notes, and private counseling observations. |
| `/mentee/login` | **Student Portal** | `mentee` | Individual mentee journey: mentor info, featured study resources, marks, and draft submissions. |

### Strict Account Isolation Rules:
1. **Cross-Role Denial:** Entering mentor or mentee credentials on `/admin/login` immediately rejects the session with a uniform authorization alert.
2. **Deactivated Account Lockdown:** Deactivated accounts (`is_active = false`) are prohibited at authentication and RLS levels.
3. **Server-Side Enforcement:** PostgreSQL `SECURITY DEFINER` functions verify role identity directly in the database (`profiles.role`), preventing client-side spoofing.

---

## 4. Component & Design-System Abstraction

The UI is structured into modular, reusable components:

- **Layout & Shell:**
  - `AppShell.tsx`: Unified desktop and mobile shell with compact sidebar, breadcrumbs, search shortcut (`⌘K`), user initials avatar (`ProfileAvatar`), and logout confirmation modal.
  - `AdminLayout.tsx`: Administration shell routing `/admin/*`.
  - `MentorLayout.tsx`: Faculty mentor shell routing `/mentor/*`.
  - `MenteeLayout.tsx`: Student mentee shell routing `/mentee/*`.
- **UI Components:**
  - `Button.tsx`: Primary gradient (`from-violet-600 to-purple-600`), Secondary (`bg-[#211A2D]`), Ghost, Outline, and Danger.
  - `Card.tsx`: Deep surface `#191521` with fine `#30263E` border and dark shadow.
  - `Badge.tsx`: `RoleBadge`, `VerificationBadge`, `ResultBadge`, and semantic status tags.
  - `StatCard.tsx`: Dark metric cards with violet hover glow.
  - `ProfileAvatar.tsx`: Initials avatar with violet-to-indigo gradient.
  - `PageHeader.tsx`: Editorial header with badge, title, subtitle, and action buttons.
  - `Modal.tsx` & `ConfirmDialog.tsx`: Backdrop blur with keyboard accessible `Escape` handler.
  - `EmptyState.tsx`: Atmospheric empty state with violet icon container.
  - `LoadingSpinner.tsx`: Dark themed violet loader.

---

## 5. Technology Stack

- **Frontend:** React 18 with Vite 6
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS with M&M dark design tokens
- **Icons:** Lucide React
- **Routing:** React Router v6 with `RoleGuard` & `ProtectedRoute` architectures
- **Form Management & Validation:** React Hook Form and Zod schemas
- **Database & Storage:** Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth (Email & Password + Password Recovery)
- **Visualizations:** Recharts (Dark theme marks breakdown and academic progress)
- **Testing:** Vitest 3, React Testing Library, and JSDOM (**28 automated tests passing 100%**)

---

## 6. Setup & Execution Commands

### Prerequisites
- Node.js (v18 or higher; v24 recommended)
- npm or pnpm

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate Supabase credentials:
```env
VITE_SUPABASE_URL=https://<your-supabase-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```
*(If no Supabase credentials are provided, M&M loads seamlessly in Demonstration Mode with Anusha and the 6 initial mentees pre-seeded).*

### Step 3: Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### Step 4: Run Automated Tests
```bash
npm test
```
All **28 tests across 5 test suites pass**:
- `academic_calculations.test.ts` (SGPA, credit weighting)
- `auth.test.ts` (Authentication, deactivation, role validation)
- `account_isolation.test.ts` (Cross-portal denial, mentor cohort isolation)
- `security_rls.test.ts` (Verified marks immutability, RLS enforcement)
- `components.test.tsx` (Component rendering)

### Step 5: Build for Production
```bash
npm run build
```
Generates an optimized production bundle in `dist/`.

---

## 7. Demonstration Accounts

Each login page includes a **Fill Demo** button:

| Role | Portal URL | Name | Demo Login Email |
| :--- | :--- | :--- | :--- |
| **Administrator** | `/admin/login` | System Administrator | `admin@nmamit.nitte.edu` |
| **Mentor** | `/mentor/login` | Anusha | `anusha.mentor@nmamit.nitte.edu` |
| **Mentee 1** | `/mentee/login` | Riya Ann | `riya.ann.demo@nmamit.nitte.edu` |
| **Mentee 2** | `/mentee/login` | Riya Pai | `riya.pai.demo@nmamit.nitte.edu` |
| **Mentee 3** | `/mentee/login` | Rohan | `rohan.demo@nmamit.nitte.edu` |
| **Mentee 4** | `/mentee/login` | Roshwin | `roshwin.demo@nmamit.nitte.edu` |
| **Mentee 5** | `/mentee/login` | Sinchana | `sinchana.demo@nmamit.nitte.edu` |
| **Mentee 6** | `/mentee/login` | Vijeth | `vijeth.demo@nmamit.nitte.edu` |
