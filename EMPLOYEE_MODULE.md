# Employee Module - DigiSahayak

## Overview

The Employee Module is a comprehensive ticket management system for DigiSahayak employees and administrators. It allows authorized staff to view, filter, and manage support tickets submitted by users.

## Access & Authentication

### Employee Accounts

Two pre-configured accounts are available:

1. **Employee Account**
   - Email: `hardik.me.chadda@gmail.com`
   - Password: `password123`
   - Role: `employee`

2. **Admin Account**
   - Email: `umamalam4@gmail.com`
   - Password: `password123`
   - Role: `admin`

### How to Access

**Method 1: Auto-Redirect (Recommended)**
1. Navigate to the login page: `/login`
2. Click the "Employee" quick-fill button for testing, or manually enter employee credentials
3. Enter password: `password123`
4. Click "Login"
5. You will be **automatically redirected** to `/employee/dashboard`

**Method 2: From Profile Page**
1. Login with employee or admin credentials
2. On your profile page, you'll see a prominent blue "Employee Dashboard" button
3. Click it to access the employee dashboard

**Method 3: Direct URL**
1. Login with employee or admin credentials
2. Manually navigate to `/employee/dashboard`

Note: Regular users are redirected to `/profile` after login and cannot access the employee dashboard.

## Features

### Dashboard Overview

The employee dashboard (`/employee/dashboard`) provides:

- **Real-time Ticket Statistics**
  - Total tickets count
  - Open tickets count
  - In-progress tickets count
  - Resolved tickets count

- **Ticket Filtering**
  - View all tickets
  - Filter by status: open, in_progress, resolved, closed
  - Filter by priority: low, medium, high, urgent

- **Ticket Management**
  - View complete ticket details including:
    - Ticket number
    - Subject
    - Description
    - User information (name and email)
    - Creation and update timestamps
    - Current status and priority
    - Employee responses
  - Update ticket status
  - Change ticket priority
  - Add response messages
  - Assign tickets to employees

### Security

All ticket API endpoints are secured with:
- **Authentication**: Requires valid `auth_token` cookie
- **Role Enforcement**: Only users with `employee` or `admin` role can access
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication token
  - `403 Forbidden`: Valid token but insufficient permissions (non-employee/admin)

## Technical Implementation

### Database Schema

The `tickets` table includes:
- `id`: Auto-incrementing primary key
- `userId`: Reference to the user who created the ticket
- `schemeId`: Optional reference to related scheme
- `ticketNumber`: Unique ticket identifier (e.g., TKT-001)
- `title`: Legacy field for backwards compatibility
- `subject`: Ticket subject line
- `description`: Detailed description of the issue
- `status`: Current status (open/in_progress/resolved/closed)
- `priority`: Priority level (low/medium/high/urgent)
- `response`: Employee's response to the ticket
- `assignedTo`: Reference to the employee assigned to handle the ticket
- `createdAt`: Timestamp when ticket was created
- `updatedAt`: Timestamp when ticket was last modified

### API Endpoints

#### GET /api/tickets
- **Purpose**: Retrieve all tickets with user information
- **Auth**: Required (employee/admin only)
- **Query Params**: 
  - `userId` (optional): Filter tickets by specific user
- **Response**: Array of ticket objects with joined user data (userName, userEmail)

#### POST /api/tickets
- **Purpose**: Create a new support ticket
- **Auth**: Required (employee/admin only)
- **Body**: `{ userId, subject, description, priority, schemeId }`
- **Response**: Created ticket object

#### PATCH /api/tickets/[id]
- **Purpose**: Update ticket status, priority, response, or assignment
- **Auth**: Required (employee/admin only)
- **Body**: `{ status?, priority?, response?, assignedTo? }`
- **Response**: Updated ticket object

### File Structure

```
DigiSahayak/
├── app/
│   ├── employee/
│   │   ├── page.tsx                  # Redirect to dashboard
│   │   └── dashboard/
│   │       └── page.tsx              # Main employee dashboard
│   └── api/
│       └── tickets/
│           ├── route.ts              # GET, POST endpoints
│           └── [id]/
│               └── route.ts          # PATCH endpoint
├── lib/
│   └── db/
│       ├── schema.ts                 # Database schema with tickets table
│       ├── migrate.ts                # Database table creation script
│       └── add-employee-users.ts     # Script to add employee/admin users
```

## Demo Data

On first API request, the system automatically seeds 6 demo tickets with various:
- Statuses: open, in_progress, resolved
- Priorities: low, medium, high
- Subjects: Payment issues, refunds, document verification, KYC, application status, form errors

## Usage Workflow

1. **Login**: Use employee or admin credentials (auto-redirects to dashboard)
2. **View Dashboard**: See ticket statistics and list
3. **Filter Tickets**: Use status/priority tabs to narrow down tickets
4. **Manage Ticket**:
   - Click on a ticket to view details
   - Update status (open → in_progress → resolved → closed)
   - Change priority as needed
   - Add response message for the user
   - Assign to yourself or another employee
5. **Navigate**: Use the Home button to return to the main DigiSahayak app
6. **Logout**: Use the logout button in the dashboard header

## New Features (Latest Update)

✨ **Improved Access & Navigation**
- **Auto-Redirect**: Employees/admins are now automatically redirected to the employee dashboard after login
- **Quick Access Button**: Added a prominent "Employee Dashboard" button on the profile page (visible only to employees/admins)
- **Home Navigation**: Added a Home button in the employee dashboard to easily return to the main app
- **Better Error Handling**: Improved session handling with automatic redirect to login on auth failures

## Notes

- The employee module integrates seamlessly with DigiSahayak's existing authentication system
- All routes are protected with cookie-based session management
- The dashboard uses Next.js 16 with App Router and React Server Components
- Styling follows DigiSahayak's design system with Tailwind CSS v4
