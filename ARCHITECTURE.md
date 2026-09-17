# DigiSahayak - Complete Application Structure

## 📊 Database vs Hardcoded Data Overview

```
✅ FROM DATABASE (Dynamic)              ❌ HARDCODED (Static)
- Users & Authentication               - UI Colors & Gradients
- Categories (7 total)                 - Category Gradients Mapping
- Schemes (42 total)                   - Navigation Buttons
- User Documents (9 per user)          - More Categories List (20+)
- User Applications (3 seeded)         - Modal Content
- Application Status                   - Help Support Info
- Eligibility Status                   - Tailwind Classes
                                       - Static Page Text
```

---

## 🗄️ DATABASE SCHEMA (SQLite with Drizzle ORM)

### File: `lib/db/schema.ts`

#### Table 1: **users** (Stores user accounts)
```typescript
users {
  id: number (PK)
  name: string
  email: string (unique)
  phone: string (unique)
  passwordHash: string
  isVerified: boolean
  otp: string
  otpExpiry: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```
**Data Source:** Database ✅
**Current Data:** 1 user seeded (Rajesh Kumar)

---

#### Table 2: **categories** (7 categories for scheme filtering)
```typescript
categories {
  id: number (PK)
  name: string ("Farmers", "Students", "Women", etc.)
  slug: string ("farmers", "students", etc.)
  icon: string ("🌾", "📚", "👩", etc.)
  description: string
  createdAt: timestamp
}
```
**Data Source:** Database ✅
**Current Data:** 7 categories seeded
**Seeded Categories:**
1. Farmers (🌾)
2. Students (📚)
3. Women (👩)
4. Children (👶)
5. Senior Citizens (👴)
6. Youth (🎓)
7. Differently Abled (♿)

---

#### Table 3: **schemes** (42 government schemes)
```typescript
schemes {
  id: number (PK)
  categoryId: number (FK → categories.id)
  title: string ("PM-KISAN", "Ujjwala Yojana", etc.)
  slug: string ("pm-kisan", "ujjwala-yojana", etc.)
  ministry: string ("Ministry of Agriculture", etc.)
  description: string (long text)
  benefits: string (bullet points)
  eligibility: string
  notEligible: string
  requiredDocuments: string
  howToApply: string
  processingTime: string
  schemeValidity: string
  commonMistakes: string
  additionalNotes: string
  officialLink: string (URL)
  imageUrl: string (stock image path)
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```
**Data Source:** Database ✅
**Current Data:** 42 schemes (6 per category)
**Example Schemes:**
- PM-KISAN (Farmers) - Income support ₹6,000/year
- National Scholarship (Students) - ₹1,000-₹2,000/month
- Ujjwala Yojana (Women) - Free LPG connection
- PM Poshan (Children) - Mid-day meal scheme
- etc.

---

#### Table 4: **user_documents** (Document tracking for users)
```typescript
user_documents {
  id: number (PK)
  userId: number (FK → users.id)
  documentName: string ("Aadhaar Card", "PAN Card", etc.)
  status: string ("missing", "uploaded", "verified")
  updatedAt: timestamp
}
```
**Data Source:** Database ✅
**Current Data:** 9 documents per user
**Documents:**
1. Aadhaar Card
2. PAN Card
3. Ration Card
4. Voter ID
5. Income Certificate
6. Caste Certificate
7. Bank Passbook
8. Electricity Bill
9. Passport

---

#### Table 5: **user_applications** (Track applications for schemes)
```typescript
user_applications {
  id: number (PK)
  userId: number (FK → users.id)
  schemeId: number (FK → schemes.id)
  status: string ("Not Started", "In Progress", "Submitted", "Approved", "Rejected")
  appliedAt: timestamp
  updatedAt: timestamp
}
```
**Data Source:** Database ✅
**Current Data:** 3 applications seeded
**Seeded Applications:**
- PM-KISAN → Status: Approved (45 days ago)
- Ujjwala Yojana → Status: In Progress (15 days ago)
- National Scholarship → Status: Not Started (2 days ago)

---

## 🌐 API ROUTES (Data Endpoints)

### File Structure: `app/api/`

#### 1. **Authentication Routes**
```
POST   /api/auth/signup           (Create new user)
POST   /api/auth/login            (Login user)
POST   /api/auth/verify-otp       (Verify OTP)
POST   /api/auth/resend-otp       (Resend OTP)
POST   /api/auth/logout           (Logout user)
GET    /api/auth/check-session    (Check if logged in)
```

#### 2. **User Data Routes**
```
GET    /api/user                  → Returns user profile data from DB
GET    /api/user/documents        → Returns 9 documents for user
GET    /api/user/applications     → Returns applications with scheme names
POST   /api/user/applications     → Create new application
PATCH  /api/user/applications     → Update application status
```

#### 3. **Scheme Routes**
```
GET    /api/categories            → Returns all 7 categories
GET    /api/schemes               → Returns all 42 schemes
```

---

## 📄 PAGES (Routes & Components)

### File: `app/page.tsx`
- **Route:** `/`
- **Type:** Splash screen (redirects to /home after 3 seconds)
- **Data:** Hardcoded ❌

### File: `app/home/page.tsx`
- **Route:** `/home`
- **Data Sources:** 
  - ✅ Categories (from `/api/categories`)
  - ✅ Schemes (from `/api/schemes`)
  - ❌ CATEGORY_GRADIENTS (hardcoded)
  - ❌ MORE_CATEGORIES (hardcoded 20 items)
- **Displays:**
  - Top 5 categories with scheme counts
  - More Categories (20 hardcoded)
  - Popular schemes (top 5 from DB)
  - All schemes grouped by category

### File: `app/categories/[slug]/page.tsx`
- **Route:** `/categories/farmers`, `/categories/students`, etc.
- **Data:** ✅ All from database (category info + filtered schemes)
- **Displays:** All schemes for selected category

### File: `app/schemes/[slug]/page.tsx`
- **Route:** `/schemes/pm-kisan`, `/schemes/ujjwala-yojana`, etc.
- **Data:** ✅ All from database (single scheme with all details)
- **Displays:** 
  - Scheme title, ministry, description
  - Key benefits
  - Eligibility criteria
  - Required documents
  - How to apply (timeline)
  - Processing time
  - Common mistakes
  - Help modal
  - Download PDF link
  - Similar schemes

### File: `app/search/page.tsx`
- **Route:** `/search`
- **Data:** ✅ Real-time search on 42 schemes from DB
- **Displays:** Search results matching user query

### File: `app/profile/page.tsx`
- **Route:** `/profile`
- **Data:** ✅ All from database
  - User info (from `/api/user`)
  - Documents (from `/api/user/documents`)
  - Applications (from `/api/user/applications`)
- **Displays:** 4 tabs
  1. Profile - User info + Quick stats
  2. Applications - Application status cards
  3. Documents - Document upload section
  4. Eligibility - Eligibility scores (hardcoded)

### File: `app/login/page.tsx`
- **Route:** `/login`
- **Data:** Hardcoded ❌
- **Type:** Login form

### File: `app/signup/page.tsx`
- **Route:** `/signup`
- **Data:** Hardcoded ❌
- **Type:** Registration form

### File: `app/verify-otp/page.tsx`
- **Route:** `/verify-otp`
- **Data:** Hardcoded ❌
- **Type:** OTP verification form

### File: `app/updates/page.tsx`
- **Route:** `/updates`
- **Data:** Hardcoded ❌ (placeholder component)
- **Type:** Notifications/Updates page

---

## 🧩 COMPONENTS (UI Building Blocks)

### Dashboard Components: `components/dashboard/`

#### 1. **UserProfileCard.tsx**
- **Data:** Props passed from page (name, phone, memberSince)
- **Source:** ✅ Database (fetched in profile page)
- **Shows:** User name, phone, member since date

#### 2. **DocumentUploadSection.tsx**
- **Data:** ✅ 9 documents from `/api/user/documents`
- **Shows:** Document list with status (missing/uploaded/verified)
- **Displays:** Document upload placeholder

#### 3. **ApplicationStatusCard.tsx** (NEW)
- **Data:** Props passed from page (schemeName, status, appliedAt)
- **Source:** ✅ Database (fetched in profile page)
- **Shows:** Scheme name, status badge, applied date, action button
- **Status Colors:**
  - Not Started → Gray
  - In Progress → Blue
  - Submitted → Yellow
  - Approved → Green
  - Rejected → Red

#### 4. **EligibilityScoreCard.tsx**
- **Data:** Hardcoded ❌ (static example scores)
- **Shows:** Eligibility score 0-100, eligibility status, reasons

---

### Scheme Detail Components: `components/scheme/`

#### 1. **HeaderGradient.tsx**
- **Data:** Ministry, title, description (from DB)
- **Shows:** Scheme header with gradient background

#### 2. **BenefitList.tsx**
- **Data:** Benefits text (from DB)
- **Shows:** Formatted benefit list

#### 3. **EligibilityList.tsx**
- **Data:** Eligibility text (from DB)
- **Shows:** Formatted eligibility list

#### 4. **NotEligibleList.tsx**
- **Data:** Not eligible criteria (from DB)
- **Shows:** Exclusion criteria

#### 5. **RequiredDocuments.tsx**
- **Data:** Required documents (from DB)
- **Shows:** Document requirements list

#### 6. **TimelineSteps.tsx**
- **Data:** How to apply text (from DB)
- **Shows:** Step-by-step application process

#### 7. **ProcessingInfo.tsx**
- **Data:** Processing time, validity (from DB)
- **Shows:** Timeline and scheme validity info

#### 8. **HelplineNumbers.tsx**
- **Data:** Hardcoded ❌ (static help info)
- **Shows:** Helpline contact options

#### 9. **SimilarSchemes.tsx**
- **Data:** ✅ Similar schemes from DB (same category)
- **Shows:** Related scheme recommendations

#### 10. **SectionCard.tsx**
- **Type:** Wrapper component
- **Shows:** Titled section with icon and content

#### 11. **SchemeOverview.tsx**
- **Data:** Ministry, description, beneficiary category
- **Shows:** Scheme overview summary

#### 12. **HelpModal.tsx** & **HelpModalWrapper.tsx**
- **Data:** Hardcoded ❌ (static help content)
- **Shows:** Help and support modal

#### 13. **PdfDownload.tsx**
- **Data:** Links (from DB)
- **Shows:** Download PDF button

#### 14. **DocumentStatusIndicator.tsx**
- **Data:** Document status
- **Shows:** Document upload status visual

---

### Navigation & UI: `components/ui/`

#### 1. **NavBar.tsx**
- **Data:** Hardcoded ❌ (static navigation items)
- **Shows:** Top navigation bar

#### 2. **SplashScreen.tsx**
- **Data:** Hardcoded ❌ (logo, text)
- **Shows:** 3-second splash screen on app load

#### 3. **SearchBar.tsx**
- **Data:** ✅ Live search on DB schemes
- **Shows:** Search input with results

#### 4. **tabs.tsx**
- **Type:** UI component from Radix UI
- **Shows:** Tab interface

#### 5. **SchemeCard.tsx**
- **Data:** Scheme title, image (from DB)
- **Shows:** Clickable scheme card

---

### Main Components: `components/`

#### 1. **CategoryCard.tsx**
- **Data:** Category name, icon, count (from DB)
- **Shows:** Clickable category card

#### 2. **PopularSchemeCard.tsx**
- **Data:** Scheme title, ministry, description (from DB)
- **Shows:** Horizontal scheme card

#### 3. **SchemeGrid.tsx**
- **Data:** Array of schemes (from DB)
- **Shows:** Grid layout of scheme cards

#### 4. **ConditionalNavBar.tsx**
- **Type:** Wrapper component
- **Shows:** NavBar only on authenticated pages

#### 5. **ViewMoreButton.tsx**
- **Type:** Reusable button component
- **Shows:** "View More" button

---

## 📁 File Structure Summary

```
DigiSahayak/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication (6 routes)
│   │   ├── user/                 # User data
│   │   │   ├── documents/        # GET documents
│   │   │   ├── applications/     # GET/POST/PATCH applications
│   │   │   └── route.ts          # GET user profile
│   │   ├── categories/           # GET all categories
│   │   └── schemes/              # GET all schemes
│   ├── page.tsx                  # Splash screen (/)
│   ├── home/                     # Dashboard (/home)
│   ├── categories/[slug]/        # Category page (/categories/farmers)
│   ├── schemes/[slug]/           # Scheme detail (/schemes/pm-kisan)
│   ├── search/                   # Search page (/search)
│   ├── profile/                  # User profile (/profile)
│   ├── login/                    # Login page
│   ├── signup/                   # Registration page
│   ├── verify-otp/               # OTP verification
│   ├── updates/                  # Notifications/Updates
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React Components
│   ├── dashboard/                # Profile page components (4)
│   │   ├── UserProfileCard.tsx
│   │   ├── DocumentUploadSection.tsx
│   │   ├── ApplicationStatusCard.tsx ✨ NEW
│   │   └── EligibilityScoreCard.tsx
│   ├── scheme/                   # Scheme detail components (14)
│   │   ├── HeaderGradient.tsx
│   │   ├── BenefitList.tsx
│   │   ├── EligibilityList.tsx
│   │   ├── NotEligibleList.tsx
│   │   ├── RequiredDocuments.tsx
│   │   ├── TimelineSteps.tsx
│   │   ├── ProcessingInfo.tsx
│   │   ├── HelplineNumbers.tsx
│   │   ├── SimilarSchemes.tsx
│   │   ├── SectionCard.tsx
│   │   ├── SchemeOverview.tsx
│   │   ├── HelpModal.tsx
│   │   ├── HelpModalWrapper.tsx
│   │   ├── PdfDownload.tsx
│   │   └── DocumentStatusIndicator.tsx
│   ├── ui/                       # UI components (5)
│   │   ├── NavBar.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SplashScreen.tsx
│   │   ├── SchemeCard.tsx
│   │   └── tabs.tsx
│   ├── CategoryCard.tsx
│   ├── PopularSchemeCard.tsx
│   ├── SchemeGrid.tsx
│   ├── ConditionalNavBar.tsx
│   └── ViewMoreButton.tsx
│
├── lib/                          # Utilities & Database
│   ├── db/                       # Database Layer
│   │   ├── schema.ts             # Database schema (5 tables)
│   │   ├── seed.ts               # Database seed data
│   │   └── index.ts              # DB connection
│   ├── auth/                     # Authentication
│   │   ├── middleware.ts         # Route protection
│   │   ├── utils.ts              # Helper functions
│   │   └── email.ts              # Email service (OTP)
│   └── data/                     # Static data
│       └── schemes.ts            # Unused - data now in DB
│
├── public/                       # Static assets
│   ├── stock_images/             # 10 stock images
│   ├── manifest.json             # PWA manifest
│   └── logo.png
│
├── drizzle/                      # Database migrations
│   ├── 0000_*.sql
│   ├── 0001_*.sql
│   ├── 0002_*.sql
│   ├── 0003_*.sql               # New: user_applications table
│   └── meta/
│
├── middleware.ts                 # Next.js middleware
├── drizzle.config.ts             # Drizzle config
├── next.config.ts                # Next.js config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
├── README.md                      # Project documentation
└── replit.md                      # Project info
```

---

## 🔄 Data Flow Examples

### Example 1: User Views Home Page
```
1. User navigates to /home
2. Page component (home/page.tsx) renders
3. useEffect hook calls fetch('/api/categories')
4. API route fetches from DB: SELECT * FROM categories
5. Returns 7 categories → displayed on page
6. Same for /api/schemes → returns 42 schemes
7. Components render using this data ✅
```

### Example 2: User Views Scheme Details
```
1. User clicks scheme (e.g., "PM-KISAN")
2. Navigates to /schemes/pm-kisan
3. Server-side page component runs
4. Query: SELECT * FROM schemes WHERE slug = 'pm-kisan'
5. Returns single scheme object with all details
6. Components extract and display:
   - Title, ministry, description (from DB)
   - Benefits list (from DB, parsed)
   - Eligibility criteria (from DB, parsed)
   - Required documents (from DB, parsed)
   - Help info (hardcoded in modal)
7. Page displays everything ✅
```

### Example 3: User Views Profile
```
1. User navigates to /profile
2. Profile page loads
3. Three parallel API calls:
   - fetch('/api/user') → returns user data
   - fetch('/api/user/documents') → returns 9 docs
   - fetch('/api/user/applications') → returns 3 apps
4. Components render with data:
   - UserProfileCard (from /api/user)
   - DocumentUploadSection (from /api/user/documents)
   - ApplicationStatusCard (from /api/user/applications)
   - EligibilityScoreCard (hardcoded example)
5. Application count shows: 3 ✅
```

---

## 📊 Data Breakdown Summary

| Component | Database Driven | Hardcoded |
|-----------|-----------------|-----------|
| Categories | ✅ 7 items | ❌ - |
| Schemes | ✅ 42 items | ❌ - |
| User Profile | ✅ Dynamic | ❌ - |
| Documents | ✅ 9 items | ❌ - |
| Applications | ✅ 3 items | ❌ - |
| Navigation | ❌ - | ✅ Menu items |
| Colors/Gradients | ❌ - | ✅ CATEGORY_GRADIENTS |
| More Categories | ❌ - | ✅ 20 items |
| Help Info | ❌ - | ✅ Modal content |
| Eligibility Examples | ❌ - | ✅ Example scores |

---

## 🚀 Current Features Status

### ✅ Complete (Database-Driven)
- [x] 7 Categories from DB
- [x] 42 Schemes with full details
- [x] User authentication
- [x] User profiles
- [x] 9 Document tracking
- [x] 3 Application tracking
- [x] Real-time search
- [x] Scheme filtering by category

### 🔄 In Progress
- [ ] Eligibility calculation engine
- [ ] Similar schemes recommendation

### ⏳ Planned
- [ ] User scheme applications (to be added)
- [ ] Eligibility score updates
- [ ] Push notifications
- [ ] Download scheme PDF

---

## 💡 Key Points

1. **Database** (SQLite): Stores all user data and scheme information
2. **API Layer**: 11 endpoints that fetch from database
3. **Frontend**: React components that consume API data
4. **Hardcoded**: Only UI design patterns and static content
5. **Types**: TypeScript for type safety across all layers
6. **ORM**: Drizzle ORM for safe database operations
