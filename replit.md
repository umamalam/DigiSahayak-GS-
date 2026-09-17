# DigiSahayak - Government Schemes Information Portal

## Overview

DigiSahayak ("Your Digital Companion") is a mobile-first Progressive Web Application (PWA) that provides easy access to information about Indian government schemes. The application helps citizens discover schemes across different categories with detailed information about benefits, eligibility, and application processes.

Built as a lightweight, fast-loading web application optimized for mobile devices, it uses server-side rendering and a local SQLite database to ensure rapid response times even on slower connections.

## Recent Changes (December 1, 2025)

**✅ COMPLETE FEATURE IMPLEMENTATION - BUILD MODE SESSION**
- **Document Upload System**: Real file upload with camera support and progress tracking
  - POST /api/documents/upload: Multipart file upload with authentication
  - Saves files to public/uploads/{userId}/ with proper file metadata
  - GET /api/documents/user: Fetch all user documents
  - Updated DocumentUploadSection component with camera capture and progress bars
  - Document types: aadhaar, pan, voter_id, passport, driving_license, passbook, income, ration, caste
- **Eligibility Scoring Engine**: Smart scheme recommendations
  - GET /api/user/eligibility: Calculates eligibility scores based on uploaded documents
  - Scoring algorithm matches required documents and criteria
  - Returns sorted list with score percentage and missing documents
- **Shortlisted for You Dashboard Section**: Personalized scheme recommendations
  - Shows top 5 schemes with ≥60% eligibility score
  - Displays progress bars, matched criteria, and missing documents
  - Horizontal scroll with responsive cards
- **Support Ticket System**: Help and support functionality
  - POST /api/tickets: Save support tickets with user_id, scheme_id, title, description
  - GET /api/tickets: Fetch user tickets
  - Status tracking (pending, resolved, etc.)
- **Database Schema Updates**:
  - user_documents table: Added file_name, file_size, content_type, status fields
  - schemes table: Added launchYear, helplinePhone, helplineEmail, pdfGuideline fields  
  - tickets table: New table for support tickets
  - All migrations applied successfully

**✅ SESSION SYSTEM - USER DATA STORED IN JWT - COMPLETE**
- **JWT Token Enhancement**: Now stores `id`, `name`, `email` in JWT payload (not just userId)
- **generateToken()**: Updated to accept user object `{ id, name, email }`
- **verifyToken()**: Returns full user data `{ id, name, email }` extracted from JWT
- **Login API**: Passes user data to generateToken for secure storage in session
- **New /api/user/me Endpoint**: 
  - Reads auth_token cookie
  - Decodes JWT to extract user data
  - Fetches additional info from database (phone, createdAt)
  - Returns `{ id, name, email, phone, createdAt }`
  - Returns 401 if no session
- **Profile Page**: Updated to fetch `/api/user/me` instead of `/api/user`
  - Passes credentials: 'include' to send auth_token cookie
  - Displays user's real name from session on dashboard
- **check-session API**: Updated to use decoded.id from new token structure

**✅ OTP VERIFICATION & PASSWORD RESET - ALL ISSUES FIXED**
- **Issue #1**: OTP verification page not opening - Route group syntax error
  - **Cause**: Signup page redirecting to `/(auth)/verify-otp` instead of `/verify-otp`
  - **Fix**: Updated `app/(auth)/signup/page.tsx` line 71 to use `/verify-otp`
- **Issue #2**: Password reset API returning database error
  - **Cause**: `password_reset` table didn't exist in database
  - **Fix**: Ran `npm run db:migrate` - migrations applied successfully!
  - **Result**: Password reset table now exists and API works
- **Session Provider**: Already whitelists `/verify-otp` and `/reset-password` as public routes
- **Complete Flow Now Works**:
  1. ✅ Signup → OTP verification page loads (no 404)
  2. ✅ Enter OTP → Successfully verified
  3. ✅ Forgot Password → /reset-password page loads (no blink/redirect)
  4. ✅ Enter email → API generates & stores OTP in database
  5. ✅ Verify OTP → OTP verification page loads correctly
  6. ✅ Set new password → Password updated successfully

**✅ MIDDLEWARE SECURITY RULES - UPDATED**
- Updated `middleware.ts` to properly protect/expose routes
- **PUBLIC Routes** (no authentication required):
  - `/login` - Login page
  - `/signup` - Sign up page
  - `/verify-otp` - OTP verification page
  - `/reset-password` - Password reset request page
  - `/reset-password/*` - All password reset subpages (verify, new password)
  - `/api/auth/*` - All auth API routes (no middleware protection for API)
- **PROTECTED Routes** (require authentication):
  - `/home` - Dashboard
  - `/profile` - User profile page
  - `/categories/*` - Category pages
  - `/schemes/*` - Scheme detail pages
  - `/updates` - Notifications page
  - `/search` - Search page
- **Logic**: 
  - Check public auth routes first - allow without token
  - Then check protected routes - redirect to login if no token
  - Prevents /reset-password from being accidentally blocked by middleware
- **Result**: Users can fully use password reset flow without authentication

**✅ BUG FIX: Password Reset Page Redirect Issue - PERMANENTLY FIXED**
- Fixed persistent blinking/redirect issue when clicking "Forgot Password?"
- **Root Cause #1**: Incorrect route group syntax in URLs (`/(auth)/login` → Fixed)
- **Root Cause #2** (THE ACTUAL ISSUE): SessionProvider was checking authentication and redirecting all non-protected pages without whitelisting `/reset-password`
- **Complete Solution**: 
  1. Updated `components/SessionProvider.tsx`:
     - Added `/reset-password` to public pages whitelist
     - Includes all subpages: `/reset-password/*` (verify, new password)
     - Now checks: `publicPages.some(page => pathname === page || pathname.startsWith(page + '/'))`
  2. Fixed URL syntax (corrected route group references)
- **Verification**: 
  - Before: GET /reset-password → check-session → GET /login (redirect/blink)
  - After: GET /reset-password → stays on page (NO redirect!)
  - Server logs confirm only 1 request: `/reset-password 200 OK`
- **Result**: Password reset flow works perfectly - no blinking, no unexpected redirects!

**✅ PASSWORD RESET SYSTEM - COMPLETE**
- Created 3-step password reset flow for authenticated users
- **Step 1: /reset-password** - Enter email to request reset OTP
  - Email validation with visual feedback
  - Calls `POST /api/auth/request-password-reset`
  - Auto-redirects to verify page on success
- **Step 2: /reset-password/verify** - Enter 6-digit OTP
  - Modern digit-by-digit OTP input boxes
  - Auto-focus between digits on input
  - 30-second resend cooldown timer
  - Resend OTP functionality
  - Calls `POST /api/auth/verify-password-reset`
- **Step 3: /reset-password/new** - Set new password
  - Password strength indicator (weak/fair/strong)
  - Real-time password match validation
  - Password visibility toggles
  - Minimum 6 characters validation
  - Calls `POST /api/auth/set-new-password`
- **Login Integration**
  - "Forgot Password?" link on login page → /reset-password
  - Tailwind styling consistent with auth pages
  - Smooth error/success states
- **Backend APIs** (Already Implemented)
  - POST `/api/auth/request-password-reset` - Generate & send OTP
  - POST `/api/auth/verify-password-reset` - Verify OTP validity
  - POST `/api/auth/set-new-password` - Update user password
  - `password_reset` table in SQLite with OTP & expiry tracking
  - Email sending via Gmail API + SMTP fallback
  - 10-minute OTP expiry configured

## Previous Changes (November 30, 2025)

**✅ PRODUCTION-READY AUTHENTICATION SYSTEM - COMPLETE**
- Enhanced auth utilities with SMTP email and Twilio SMS support
- Added sendVia option (email/SMS) for OTP delivery on signup
- Rate limiting: 3 OTP requests per 5 minutes per identifier
- Environment-based JWT secret (no hardcoded fallback)
- Proper bcrypt password hashing with configurable salt rounds
- HTTPOnly cookies with secure flags for production
- Updated signup page with Email/SMS OTP choice

**✅ DATABASE-DRIVEN SCHEME CATEGORIES - COMPLETE**
- Expanded database from 42 to 62+ schemes across 7 categories
- Added 20 new schemes total:
  - Farmers: 6 → 10 schemes (added Sinchayee, RKVY, Agri-Clinics, etc.)
  - Students: 6 → 10 schemes (added Higher Education Loans, Vidyasaarathi, etc.)
  - Women: 6 → 10 schemes (added Mahila Shakti Kendra, RMK, NRLM, etc.)
  - Children: 6 → 10 schemes (added ICDS, PMSMA, Nutrition, etc.)
  - Senior Citizens: 6 → 8 schemes (added Health Insurance, IPSC)
  - Youth: 6 → 10 schemes (added Apprenticeship, EDP, PM Intern, etc.)
  - Differently Abled: 6 → 10 schemes (added Rehab Scholarship, Employment schemes, etc.)
- Home page already fetches all schemes dynamically using `getSchemesByCategory()`
- "Schemes for [Category]" sections on home page now show all database schemes
- NO UI CHANGES - kept exact same layout, cards, grid, horizontal scroll
- UI automatically displays all available schemes from database

**✅ Task 3: Application Tracking System - COMPLETE** (Previous)
- Created `user_applications` table with userId, schemeId, status, appliedAt, updatedAt
- Seeded 3 example applications: PM-KISAN (Approved), Ujjwala (In Progress), National Scholarship (Not Started)
- Created `/api/user/applications` route with GET, POST, PATCH endpoints
- Added "Applications" tab to profile page with real DB-driven data
- Created ApplicationStatusCard component with status-based colors and CTAs

**✅ Tasks 1 & 2: User System & Documents** (Previous)
- User system with database-driven profiles
- Document verification with 9 real documents
- Both fully integrated with profile page

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 15 with App Router
- Uses React Server Components as the default rendering strategy
- Server-side data fetching for all database queries
- Client components used sparingly, only for interactive features
- Mobile-first responsive design using Tailwind CSS v4

**Routing Structure**:
- `/` - Splash screen with 3-second animation, auto-redirects to /home
- `/home` - Homepage with dynamically fetched category schemes
- `/categories/[slug]` - Category pages showing filtered schemes
- `/schemes/[id]` - Individual scheme detail pages (ID-based routing)
- `/search` - Client-side search with filtering
- `/updates` - Notifications page
- `/profile` - User dashboard with tabs (Profile, Documents, Applications, Eligibility)
- `/login` & `/verify-otp` - Authentication flows

**Component Organization**:
- UI components in `components/ui/` directory
- Scheme components in `components/scheme/` directory
- Reusable components: NavBar, SchemeCard, SearchBar, SplashScreen
- Bottom navigation on mobile with active state highlighting
- All cards use rounded-2xl or rounded-3xl for modern appearance

### Backend Architecture

**Database**: SQLite with better-sqlite3 driver
- Single-file database (`sqlite.db`)
- Zero configuration, excellent for read-heavy workloads

**ORM**: Drizzle ORM
- Type-safe database queries with TypeScript
- Schema-first approach

**Database Schema**:
- `users` table: User accounts with authentication
- `categories` table: Scheme categories (7 total)
- `schemes` table: Individual schemes (62 total, growing)
- `userDocuments` table: User document uploads (9 types)
- `userApplications` table: User scheme applications (status tracking)

**API Routes**:
- `/api/categories` - All categories with scheme counts
- `/api/schemes` - All schemes with optional filtering
- `/api/schemes/[id]` - Individual scheme by ID
- `/api/user/profile` - User profile data
- `/api/user/documents` - User document status
- `/api/user/applications` - User applications list
- `/api/auth/signup` - User registration with OTP (supports email/SMS)
- `/api/auth/login` - User login with password
- `/api/auth/logout` - Logout and clear session
- `/api/auth/verify-otp` - OTP verification
- `/api/auth/resend-otp` - Resend OTP (rate limited)
- `/api/auth/check-session` - Session validation

**Data Flow**:
- Server Components fetch directly from database
- API routes handle client-side data fetching
- Homepage dynamically fetches all categories and schemes
- Category pages filter schemes by category ID
- Scheme detail pages fetch individual schemes by ID

### Design Patterns

**Server-First Architecture**:
- React Server Components reduce client-side JavaScript
- Database queries on server reduce network requests
- HTML streamed to client for faster performance

**Mobile-First PWA**:
- Progressive Web App manifest enables mobile installation
- Standalone display mode for app-like experience
- Theme color: #4568F0 (blue)
- Responsive breakpoints: mobile → tablet → desktop

**Type Safety**:
- TypeScript throughout
- Auto-generated database schema types via Drizzle

## External Dependencies

### Core Framework
- Next.js 16.0.3
- React 19.2.0
- TypeScript 5.x

### Database Stack
- better-sqlite3 ^12.4.1
- drizzle-orm ^0.44.7
- drizzle-kit ^0.31.7

### UI & Styling
- Tailwind CSS v4
- lucide-react ^0.553.0

### Authentication & Security
- bcryptjs ^3.0.3
- jsonwebtoken ^9.0.2
- nodemailer ^7.0.11

### Development Tools
- tsx ^4.20.6
- babel-plugin-react-compiler 1.0.0
- ESLint 9.x

## Environment Variables

**Required for Production:**
```bash
JWT_SECRET=your-secure-random-secret-key   # Required - JWT signing key
```

**Optional Configuration:**
```bash
JWT_EXPIRES_IN=7d                          # Token expiry (default: 7d)
OTP_EXPIRY_MIN=10                          # OTP validity in minutes (default: 10)
BCRYPT_SALT_ROUNDS=10                      # Password hashing rounds (default: 10)
```

**Email OTP (Optional - falls back to console logging):**
```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM="DigiSahayak <noreply@example.com>"
```

**SMS OTP via Twilio (Optional - falls back to console logging):**
```bash
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## How to Run

```bash
# Install dependencies
npm install

# Seed database with schemes and categories
npm run db:seed

# Start development server on port 5000
npm run dev
```

The app will be available at http://0.0.0.0:5000 (accessible via Replit's web preview).

## Deployment

The app is ready for deployment on Replit as a Next.js web application. The SQLite database is self-contained and requires no external configuration.

## Future Roadmap

- Live tracking of scheme application status
- Push notifications for scheme updates
- Offline support with service workers
- Multiple language support
- Integration with government payment systems
