# DigiSahayak – Your Digital Government Scheme Assistant

A modern, mobile-first Progressive Web Application (PWA) that makes discovering and applying for Indian government schemes simple, fast, and accessible to all citizens.

![DigiSahayak](./public/logo.png)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Completed Features](#completed-features)
- [Folder Structure](#folder-structure)
- [How to Run](#how-to-run)
- [Future Roadmap](#future-roadmap)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

---

## Project Overview

### What is DigiSahayak?

**DigiSahayak** ("Digital Assistant" in Hindi) is a Progressive Web Application designed to help Indian citizens discover, understand, and apply for government schemes. The platform bridges the gap between citizens and valuable government benefits by providing clear, comprehensive, and easy-to-understand information.

### Purpose

DigiSahayak solves the problem of **information fragmentation**:
- Government schemes are scattered across multiple official websites
- Documentation is often technical and difficult to understand
- Citizens don't know which schemes they're eligible for
- Application processes are unclear and complicated

### Target Users

- 👨‍🌾 **Farmers** - Agricultural subsidy schemes, credit schemes, insurance
- 👩‍🎓 **Students** - Education loans, scholarships, skill development
- 👩 **Women** - Empowerment schemes, financial assistance, employment
- 👶 **Families with Children** - Nutrition, healthcare, education benefits
- 👴 **Senior Citizens** - Pension schemes, healthcare, social security
- 💼 **Youth** - Skill training, employment, entrepreneurship schemes

### Problems Solved

1. **Centralized Information** - All schemes in one place instead of searching multiple websites
2. **User-Friendly Content** - Complex government policies explained in simple language
3. **Smart Filtering** - Find schemes by category that match your needs
4. **Real Application Steps** - Clear, step-by-step guidance on how to apply
5. **Document Checklist** - Know exactly what documents you need before applying
6. **Quick Help & Support** - Get answers through the built-in help system

### Why DigiSahayak?

✅ **Mobile-First** - Designed for users on phones with limited data  
✅ **Offline-Ready** - PWA technology means it works even without internet  
✅ **Fast & Lightweight** - Optimized for speed on all devices  
✅ **No Login Required** - Browse schemes without creating an account  
✅ **Accessible** - Simple interface designed for all literacy levels  
✅ **Real Data** - Comprehensive, up-to-date scheme information  

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 16.0.3** | React framework with App Router & Server Components |
| **React 19** | UI library with modern hooks |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **Framer Motion** | Smooth animations (where needed) |
| **Lucide React** | Beautiful, consistent icons |
| **React Tabs** (Radix UI) | Accessible tabbed interface |

### Backend & Database

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Next.js API Routes** | Lightweight backend for authentication |
| **SQLite + better-sqlite3** | Fast, embedded database for development |
| **Drizzle ORM** | Type-safe database access & migrations |

### Authentication & Security

| Technology | Purpose |
|------------|---------|
| **bcryptjs** | Password hashing |
| **jsonwebtoken (JWT)** | Session tokens for authentication |
| **nodemailer** | OTP email delivery |
| **HTTPOnly Cookies** | Secure session storage |

### Development & Build Tools

| Technology | Purpose |
|------------|---------|
| **TypeScript 5** | Type safety across the codebase |
| **ESLint** | Code quality linting |
| **tsx** | TypeScript execution |
| **Tailwind Compiler** | CSS processing |

### Deployment

- **Replit** - Cloud hosting platform with automatic deployments

---

## Completed Features

### A. Authentication System

- ✅ **Login & OTP Verification**
  - Email-based OTP flow
  - Secure OTP generation and validation
  - Session-based authentication with HTTPOnly cookies
  
- ✅ **Protected Routes**
  - Automatic redirects for unauthenticated users
  - Protected pages: /home, /profile, /schemes/*, /categories/*, /search, /updates

- ✅ **User Session Management**
  - Persistent sessions across refreshes
  - Secure logout functionality
  - Session expiration handling

### B. Dashboard

- ✅ **Home Dashboard** (`/home`)
  - Welcome banner with user greeting
  - Category grid: Farmers, Students, Women, Children, Senior Citizens, Youth
  - Featured schemes carousel
  - Real-time scheme count
  - Responsive grid layout (1 column mobile → 2 columns tablet → 3 columns desktop)

- ✅ **Bottom Navigation Bar**
  - Home, Search, Updates, Profile, Logout
  - Active state indicators
  - Mobile-optimized with 70px fixed height
  - Icon + label navigation

- ✅ **Mobile-First Responsive Design**
  - Mobile: max-w-sm (narrow, single column)
  - Tablet: md:max-w-2xl (wider, 2 columns)
  - Desktop: lg:max-w-3xl (comfortable spacing)
  - Extra Large: xl:max-w-4xl (full spacious layout)

### C. Category Pages

- ✅ **42 Fully Seeded Schemes** (6 per category)
  - Real government schemes with accurate information
  - Idempotent seed script (safe to run multiple times)

- ✅ **Categories Implemented**
  - 👨‍🌾 **Farmers** - PM-KISAN, Kisan Credit Card, PM Fasal Bima, Soil Health Card, etc.
  - 👩‍🎓 **Students** - Scholarship schemes, education loans, skill training
  - 👩 **Women** - Empowerment programs, financial assistance
  - 👶 **Children** - Nutrition, healthcare, education benefits
  - 👴 **Senior Citizens** - Pension schemes, healthcare
  - 💼 **Youth** - Employment, skill development, entrepreneurship

### D. Comprehensive Scheme Detail Pages

Each scheme includes:

| Section | Details |
|---------|---------|
| **Scheme Overview** | Ministry, launch year, target beneficiaries, quick summary |
| **Key Benefits** | All benefits listed with color-coded styling (green) |
| **Eligibility Criteria** | Clear requirements for qualification (blue) |
| **Who is NOT Eligible** | Exclusion criteria in red for clarity |
| **Required Documents** | Complete document checklist with status tracker |
| **Document Status** | Visual indicator showing which docs are missing |
| **How to Apply** | Step-by-step application process with timeline |
| **Important Information** | Processing time, validity, common mistakes, notes |
| **Get Help & Support** | Helpline numbers, email, official website |
| **Download Guidelines** | PDF links for official scheme documents |
| **Similar Schemes** | Related schemes for discovery |

### E. Premium UI Enhancements

- ✅ **Gradient Headers**
  - Eye-catching hero section with gradient background
  - Scheme image with overlay
  - Ministry badge and title

- ✅ **Rounded Card Sections**
  - Consistent 2xl border radius
  - Subtle shadows and borders
  - Color-coded backgrounds (green, blue, red, purple, amber)

- ✅ **Responsive Spacing**
  - Mobile: Compact spacing for screen real estate
  - Tablet/Desktop: Generous padding and margins
  - Section spacing: 6 → 8 → 10 units (mobile → tablet → desktop)
  - Container width scaling with breakpoints

- ✅ **Better Readability**
  - Proper text hierarchy (16px → 20px → 24px titles)
  - Line spacing for long-form content
  - Icon + text combinations for visual clarity

- ✅ **Button Positioning Fixed**
  - Buttons positioned above bottom navbar with pb-[120px] spacing
  - No overlap with navigation
  - mb-6 margin-bottom for breathing room
  - Smooth scrolling without sticky behavior

### F. Get Help & Support System

- ✅ **Help Modal Component**
  - Non-intrusive modal for getting support
  - Zero blinking or flickering
  - CSS-based visibility (not conditional rendering)
  - React.memo optimization for stable references

- ✅ **Form Fields**
  - User name input
  - Email input
  - Message textarea
  - Support type selector

- ✅ **Smooth Open/Close**
  - Fade animations (opacity transitions)
  - No jarring mount/unmount cycles
  - Positioned above all content (z-[9999])
  - Centered alignment with proper spacing

### G. Search Functionality

- ✅ **Real-Time Search** (`/search`)
  - Search by scheme name, description, or ministry
  - Instant filtered results as you type
  - No lag or delay
  - Search bar on every page via bottom nav

### H. Profile Section

- ✅ **Basic User Dashboard** (`/profile`)
  - Welcome with user name
  - Quick action buttons
  - Tabbed interface for multiple sections

- ✅ **Profile Tab**
  - User information display
  - Edit capabilities (UI ready, backend pending)
  - Account preferences

- ✅ **Documents Tab**
  - Document upload section (UI ready)
  - File status indicators
  - Real document types: Aadhaar, PAN, Bank Passbook, etc.

- ✅ **Eligibility Tab**
  - Eligibility score (0-100%)
  - Progress bar visualization
  - Quick eligibility tips

---

## Folder Structure

```
DigiSahayak/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Splash screen
│   ├── home/
│   │   └── page.tsx               # Dashboard
│   ├── schemes/
│   │   └── [slug]/
│   │       └── page.tsx           # Scheme detail page
│   ├── categories/
│   │   └── [slug]/
│   │       └── page.tsx           # Category schemes list
│   ├── search/
│   │   └── page.tsx               # Search results
│   ├── updates/
│   │   └── page.tsx               # Notifications/Updates
│   ├── profile/
│   │   └── page.tsx               # User profile
│   ├── login/
│   │   └── page.tsx               # Login page
│   ├── verify-otp/
│   │   └── page.tsx               # OTP verification
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.ts           # Login endpoint
│   │   │   ├── verify-otp.ts      # OTP verification
│   │   │   └── logout.ts          # Logout endpoint
│   │   └── schemes/
│   │       └── [slug].ts          # Scheme details API
│   └── middleware.ts              # Authentication middleware
│
├── components/
│   ├── scheme/                    # Scheme detail components
│   │   ├── HeaderGradient.tsx     # Hero section with gradient
│   │   ├── SectionCard.tsx        # Reusable section wrapper
│   │   ├── BenefitList.tsx        # Benefits display
│   │   ├── EligibilityList.tsx    # Eligibility criteria
│   │   ├── NotEligibleList.tsx    # Exclusion criteria
│   │   ├── RequiredDocuments.tsx  # Document checklist
│   │   ├── DocumentStatusIndicator.tsx # Document tracker
│   │   ├── TimelineSteps.tsx      # Application steps
│   │   ├── ProcessingInfo.tsx     # Timeline & details
│   │   ├── SchemeOverview.tsx     # Scheme summary
│   │   ├── HelplineNumbers.tsx    # Support contacts
│   │   ├── PdfDownload.tsx        # Download section
│   │   ├── SimilarSchemes.tsx     # Related schemes
│   │   ├── HelpModal.tsx          # Help modal form
│   │   └── HelpModalWrapper.tsx   # Modal controller
│   │
│   ├── dashboard/                 # Dashboard components
│   │   ├── DocumentUploadSection.tsx  # Upload UI
│   │   ├── UserProfileCard.tsx        # Profile summary
│   │   ├── EligibilityScoreCard.tsx   # Eligibility progress
│   │   └── Tabs.tsx                   # Tabbed interface
│   │
│   ├── navigation/
│   │   ├── NavBar.tsx             # Top navigation
│   │   ├── BottomNav.tsx          # Bottom tab navigation
│   │   └── SideNav.tsx            # Mobile menu (future)
│   │
│   ├── cards/
│   │   ├── SchemeCard.tsx         # Scheme grid item
│   │   └── CategoryCard.tsx       # Category grid item
│   │
│   └── common/
│       ├── SearchBar.tsx          # Search input
│       ├── SplashScreen.tsx       # App loading screen
│       └── HelpModalWrapper.tsx   # Help modal container
│
├── lib/
│   ├── db/
│   │   ├── index.ts               # Database connection
│   │   └── schema.ts              # Drizzle schema
│   ├── auth.ts                    # Auth helpers
│   ├── utils.ts                   # Utility functions
│   └── types.ts                   # TypeScript interfaces
│
├── data/
│   ├── schemes.json               # Seed data (42 schemes)
│   └── categories.json            # Category definitions
│
├── public/
│   ├── logo.png                   # App logo
│   ├── manifest.json              # PWA manifest
│   ├── stock_images/              # Scheme images
│   └── favicon.ico                # Browser tab icon
│
├── styles/
│   └── globals.css                # Global Tailwind CSS
│
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── tailwind.config.js             # Tailwind CSS config
├── next.config.js                 # Next.js config
├── drizzle.config.ts              # Database config
└── .env.local                     # Environment variables
```

---

## How to Run

### Prerequisites

- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org)
- **Git** - For version control
- **npm or yarn** - Package manager (comes with Node.js)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/digisahayak.git
   cd digisahayak
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # Email (for OTP)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   
   # JWT Secret
   JWT_SECRET=your-super-secret-key-min-32-chars
   
   # Session
   SESSION_SECRET=your-session-secret-key
   ```

4. **Initialize Database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Database migrations
npm run db:push
npm run db:generate
npm run db:studio

# Seed database
npm run db:seed

# TypeScript check
npm run typecheck

# Linting
npm run lint
```

### Testing on Mobile

Since DigiSahayak is a PWA:

1. Run the dev server: `npm run dev`
2. Open in browser: `http://localhost:5000`
3. On mobile, you can add to home screen for native-like experience
4. Works offline with cached data

---

## Future Roadmap

### Phase 2: Enhanced User Experience

- 📱 **Push Notifications** - Alert users about new schemes matching their profile
- 🌐 **Multilingual Support** - Support for Hindi, Tamil, Telugu, Marathi, etc.
- 🔔 **Scheme Reminders** - Notify users about application deadlines
- 🎯 **Personalized Recommendations** - AI-based scheme matching based on user profile

### Phase 3: Application System

- 📝 **Online Application Portal** - Submit applications directly through the app
- 📄 **Document Upload System** - Upload required documents securely
- ✅ **Eligibility Checker Engine** - Real-time eligibility scoring (0-100%)
- 📊 **Application Tracker** - Track status of submitted applications
- 🔄 **Form Auto-Fill** - Pre-populate forms with user information

### Phase 4: Support System

- 💬 **Support Tickets** - Submit and track help requests
- 💭 **Community Forum** - Users share experiences and tips
- 🎓 **Video Tutorials** - Step-by-step video guides for each scheme
- 🤖 **AI Chatbot** - Instant answers to common questions
- 📞 **Callback Request** - Schedule phone support from government offices

### Phase 5: Intelligence & Analytics

- 🧠 **ML-Based Scheme Matching** - Learn user preferences for better recommendations
- 📈 **Success Rate Analytics** - Show approval rates for each scheme
- 🗺️ **Location-Based Schemes** - Filter by state and district
- 👥 **Success Stories** - Real testimonials from beneficiaries
- 📊 **Dashboard Insights** - User journey analytics and feedback

### Phase 6: Administration

- 👨‍💼 **Admin Panel** - Manage schemes and content
- 📊 **Analytics Dashboard** - Track app usage and user engagement
- 🔐 **Verification System** - Verify user documents and eligibility
- 📢 **Announcement System** - Broadcast important updates

---

## Contribution Guidelines

### How to Contribute

We welcome contributions! Here's how to get started:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/digisahayak.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Keep changes focused and well-documented
   - Follow the existing code style
   - Use TypeScript for type safety

4. **Test Your Changes**
   ```bash
   npm run dev
   npm run typecheck
   npm run lint
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Describe what you changed and why
   - Reference any related issues
   - Wait for review and feedback

### Code Style

- **TypeScript** - All code must be typed
- **Naming** - Use camelCase for variables, PascalCase for components
- **Components** - Keep components focused and reusable
- **Comments** - Document complex logic clearly
- **Formatting** - Use Prettier for consistent formatting

### Reporting Issues

Found a bug or have a suggestion?

1. Check existing issues first
2. Create a new issue with clear title and description
3. Include steps to reproduce (for bugs)
4. Share screenshots if relevant

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

### What This Means

✅ You can use, modify, and distribute the code  
✅ Include a copy of the license  
✅ No warranty provided (use at your own risk)  
✅ The original author is not liable for issues  

---

## Support & Community

- 📧 **Email Support** - [support@digisahayak.com](mailto:support@digisahayak.com)
- 💬 **GitHub Discussions** - Share ideas and ask questions
- 🐛 **GitHub Issues** - Report bugs or request features
- 🌟 **Star the Project** - Show your support!

---

## Acknowledgments

- **Indian Government** - For comprehensive scheme data
- **Open Source Community** - For amazing libraries and frameworks
- **Next.js Team** - For the excellent React framework
- **Tailwind CSS** - For beautiful utility-first CSS

---

## Roadmap Status

| Phase | Status | Target |
|-------|--------|--------|
| Phase 1: Core Features | ✅ Complete | Nov 2024 |
| Phase 2: UX Enhancements | 🚧 In Progress | Jan 2025 |
| Phase 3: Applications | 📋 Planned | Mar 2025 |
| Phase 4: Support System | 📋 Planned | May 2025 |
| Phase 5: Intelligence | 📋 Planned | Jul 2025 |
| Phase 6: Admin Panel | 📋 Planned | Sep 2025 |

---

**Made with ❤️ to help Indian citizens discover government schemes**

Last Updated: November 29, 2024
