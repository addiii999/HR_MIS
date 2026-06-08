# Human Resource MIS

A browser-based Human Resource Management Information System built with React. The application covers the complete employee lifecycle — from vacancy creation through recruitment, onboarding, attendance monitoring, performance assessment, grievance resolution, and exit management — and provides an analytics dashboard to support HR decision-making.

---

## Project Overview

This system is designed as a decision-support platform rather than a simple CRUD database. Each module surfaces derived metrics and contextual insights alongside its operational data. The dashboard aggregates cross-module KPIs and renders trend charts that allow HR managers and department heads to act on workforce data rather than merely record it.

All data is stored client-side using the browser's localStorage API with a structured seed dataset. This eliminates backend infrastructure for demonstration and academic evaluation purposes while maintaining the full application architecture.

---

## Features

### Vacancy Management
Create and track job requisitions per department. Each vacancy records the hiring platform, posting duration, required profile, and open/fulfilled/closed status.

### Recruitment Tracking
Track the full application pipeline per vacancy: applications received, shortlisted, interviewed, selected, rejected, and joined. Calculates per-platform conversion rates.

### Employee Management
Maintain a full employee directory with personal details, department, designation, date of joining, employment category, and status. Supports add, edit, and delete operations with real-time filtering by department and status.

### Attendance Monitoring
Daily attendance register with present/absent toggling for HR admins and department heads. Displays departmental attendance breakdown, a 7-day trend chart, and top-attendance employee rankings.

### Performance Assessment
Quarterly performance reviews with numerical scores, qualitative feedback, areas for improvement, outcome ratings (Excellent / Good / Average / Poor), and HR recommendations (Promotion / Hike / PIP / None).

### Feedback Management
Record formal positive and negative feedback events with the responsible manager, the affected employee, a description, and the corrective or recognition action taken.

### Grievance Management
Log and track employee grievances with complainant, respondent, description, status (Open / Under Review / Resolved), remarks, and resolution date.

### Exit Management
Manage employee separations including resignation date, last working day, reason, asset return status, experience letter issuance, and exit status.

### Role-Based Access Control
Three user roles with differentiated data visibility and edit permissions: HR Admin, Department Head, and Employee.

### MIS Dashboard
Aggregated analytics view covering eight KPI cards, department headcount chart, monthly hiring vs. attrition trend, attendance trend, recruitment funnel, platform performance, gender ratio, category analysis, performance distribution, AI-generated decision insights, recent joiners, and top performers.

### Notifications
System-generated alerts for pending interviews, unresolved grievances, expiring vacancies, and due performance assessments.

---

## Technology Stack

### Frontend
- **React 19** — component-based UI rendering
- **React Router DOM 7** — client-side routing with nested layout support
- **Recharts 3** — composable charting library for all dashboard visualisations
- **Lucide React** — consistent icon set
- **date-fns 4** — date utility functions
- **Vite 8** — development server and production bundler

### State & Data
- **localStorage** — persistent client-side data store
- **sessionStorage** — session-scoped authentication state

### Styling
- Vanilla CSS with CSS custom properties (design tokens)
- Glassmorphism design language with backdrop-filter blur effects

### Deployment
- **GitHub Pages** — static hosting via GitHub Actions CI/CD pipeline

---

## System Architecture

```
Browser
  |
  +-- React SPA (Vite build)
        |
        +-- React Router DOM
        |     |-- AppLayout (navbar, background, auth guard)
        |     +-- Pages (Dashboard, Employees, Recruitment, ...)
        |
        +-- AuthContext (session state via sessionStorage)
        |
        +-- Store (src/store/index.js)
              |-- localStorage read/write
              +-- Seed data initialisation on first load
```

Data flow is unidirectional. Pages call store functions (`getCollection`, `addItem`, `updateItem`, `deleteItem`) directly. There is no global state manager — each page owns its local state and refreshes from the store after mutations.

---

## Folder Structure

```
hr-mis/
|
+-- public/
|   +-- logo.svg                   Branded favicon
|
+-- src/
|   +-- assets/                    Static image assets
|   |
|   +-- components/
|   |   +-- shared/
|   |       +-- PageHeader.jsx     Universal page header with breadcrumbs
|   |       +-- ui/
|   |           +-- StatCard.jsx   KPI metric card
|   |           +-- InsightCard.jsx  Decision-support insight card
|   |           +-- Modal.jsx      Reusable dialog component
|   |
|   +-- constants/
|   |   +-- index.js               Chart colours, status maps, enum lists
|   |
|   +-- contexts/
|   |   +-- AuthContext.jsx        Authentication state and login/logout logic
|   |
|   +-- layouts/
|   |   +-- AppLayout.jsx          Root layout with auth guard and orb background
|   |   +-- Navbar.jsx             Liquid glass floating navigation bar
|   |
|   +-- pages/
|   |   +-- auth/
|   |   |   +-- LoginPage.jsx
|   |   +-- dashboard/
|   |   |   +-- Dashboard.jsx
|   |   +-- employees/
|   |   |   +-- Employees.jsx
|   |   |   +-- Attendance.jsx
|   |   +-- recruitment/
|   |   |   +-- Vacancies.jsx
|   |   |   +-- Recruitment.jsx
|   |   |   +-- Interviews.jsx
|   |   |   +-- Offers.jsx
|   |   +-- hrops/
|   |       +-- Performance.jsx
|   |       +-- Feedback.jsx
|   |       +-- Grievances.jsx
|   |       +-- Exits.jsx
|   |
|   +-- store/
|   |   +-- index.js               localStorage-backed data store with CRUD helpers
|   |
|   +-- styles/
|   |   +-- index.css              Global design system (tokens, components, utilities)
|   |   +-- App.css                App-level style overrides
|   |
|   +-- utils/
|   |   +-- index.js               Pure helper functions (formatDate, getInitials, etc.)
|   |
|   +-- App.jsx                    Route definitions
|   +-- main.jsx                   Application entry point
|
+-- docs/
|   +-- ARCHITECTURE.md            Detailed system design documentation
|
+-- .github/
|   +-- workflows/
|       +-- deploy.yml             GitHub Actions Pages deployment
|
+-- index.html                     Vite HTML entry point
+-- vite.config.js                 Vite configuration with @ path alias
+-- eslint.config.js               ESLint configuration
+-- package.json
+-- README.md
```

---

## Installation

### Prerequisites
- Node.js 18 or later
- npm 9 or later

### Setup

```bash
# Clone the repository
git clone https://github.com/addiii999/HR_MIS.git
cd HR_MIS

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173/HR_MIS/`.

### Production Build

```bash
npm run build
```

The compiled output is written to `dist/`.

---

## Usage

### Login

Navigate to the application root. The login page presents three pre-seeded demo accounts:

| Role | Email | Password |
|---|---|---|
| HR Admin | admin@hrms.com | admin123 |
| Department Head | head@hrms.com | head123 |
| Employee | emp@hrms.com | emp123 |

### Dashboard

The dashboard is the default landing page after login. It aggregates data from all modules into KPI cards, charts, and decision-support insights. No navigation is required to get an overview of workforce health.

### Recruitment Workflow

1. Create a vacancy under **Recruitment > Vacancies**
2. Track application pipeline under **Recruitment > Applications**
3. Schedule and record interviews under **Recruitment > Interviews**
4. Issue an offer letter and record joining details under **Recruitment > Offers & Joining**

### Employee Management

Use **Employees** to view, add, edit, or remove employee records. Use **Attendance** to mark or review daily presence.

### HR Operations

Performance reviews, feedback records, grievances, and exit processing are grouped under the **HR Ops** navigation dropdown.

---

## Role-Based Access

### HR Admin
Full read and write access to all modules. Can manage employee records, mark attendance, add performance reviews, process grievances, and log exits.

### Department Head
Read access to all modules. Can mark attendance for their department. Cannot modify employee records or HR operational data.

### Employee
Read-only access. Can view the dashboard and their own records. Cannot edit any data.

---

## Dashboard Analytics

### KPI Cards
Eight real-time metrics: active employees, new joiners this month, open vacancies, hiring conversion rate, average performance score, open grievances, pending interviews, and exits this year.

### Charts
- Department headcount (bar chart)
- Monthly hiring vs. attrition trend (area chart)
- Attendance percentage trend — last 7 working days (line chart)
- Gender ratio (donut chart)
- Employee category distribution (pie chart)
- Recruitment funnel — applications to joinings (progress bars)
- Platform performance — conversion rate per source (progress bars)
- Performance distribution — Q1 ratings (bar chart)

### Decision Insights
Four derived recommendations surfaced automatically: best-performing hiring platform, department with highest attrition risk, department with the most grievances, and underperforming employees flagged for Performance Improvement Plans.

### Recruitment Pipeline
A visual seven-stage pipeline: Vacancy Request → Job Posting → Resume Screening → Interviews → Selection → Offer → Joining.

---

## Security

- Passwords are stripped from the session object before storing in sessionStorage — raw credentials are never held in browser memory after authentication.
- Route access requires a valid session; unauthenticated requests are redirected to the login page.
- Role checks are enforced in both the UI (conditional rendering) and store operations (edit guards for the Employee role).

---

## Future Enhancements

- **Backend API integration** — Replace localStorage with a REST API backed by PostgreSQL or MongoDB.
- **Real authentication** — JWT-based authentication with refresh token rotation.
- **File uploads** — Attachment support for offer letters and experience certificates.
- **Email notifications** — Trigger alerts for interview schedules and grievance status changes.
- **Export functionality** — Generate PDF or Excel reports from all modules.
- **Audit log** — Record all data mutations with timestamp and actor.
- **Multi-organisation support** — Tenant isolation for SaaS deployment.

---

## License

This project is released under the MIT License. See `LICENSE` for details.
