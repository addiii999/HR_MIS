# Architecture Reference

This document describes the internal design of the HR MIS frontend application.

---

## Module Responsibilities

| Module | Location | Responsibility |
|---|---|---|
| Entry point | `src/main.jsx` | Mounts the React root with StrictMode |
| Router | `src/App.jsx` | Declares all client-side routes |
| Auth guard | `src/layouts/AppLayout.jsx` | Redirects unauthenticated users to /login |
| Session state | `src/contexts/AuthContext.jsx` | Login, logout, role checking via sessionStorage |
| Data store | `src/store/index.js` | All localStorage read/write; seed data initialisation |
| Design tokens | `src/styles/index.css` | CSS custom properties; all visual primitives |
| Constants | `src/constants/index.js` | Chart colours, status badge maps, enum lists |
| Utilities | `src/utils/index.js` | Pure functions: formatDate, getInitials, percent, clamp |

---

## Data Flow

```
User action (form submit / toggle / delete)
  |
  v
Page component calls store function
  (addItem / updateItem / deleteItem / saveCollection)
  |
  v
store/index.js reads current state from localStorage,
applies mutation, writes back as JSON string
  |
  v
Page component calls getCollection() to re-read fresh state
  |
  v
React setState triggers re-render with updated data
```

There is no global reactive state store (no Redux, no Zustand, no Context for data). Each page manages its own local state and treats the localStorage store as the source of truth.

---

## Authentication Model

1. On application load, `AuthProvider` calls `initStore()` to seed localStorage if empty.
2. `initStore()` checks sessionStorage for a persisted user object.
3. `login(email, password)` looks up the user in the store's `users` collection, strips the password field, and writes the safe object to sessionStorage.
4. `useAuth()` exposes `user`, `login`, `logout`, and `hasRole()` to all components via React Context.
5. `AppLayout` reads `useAuth().user`; if null it returns a `<Navigate to="/login" />` redirect.

---

## Routing Structure

```
/login              LoginPage (no auth required)
/                   AppLayout (auth guard)
  /dashboard        Dashboard
  /employees        Employees
  /attendance       Attendance
  /vacancies        Vacancies
  /recruitment      Recruitment (Applications)
  /interviews       Interviews
  /offers           Offers & Joining
  /performance      Performance Assessment
  /feedback         Feedback
  /grievances       Grievances
  /exits            Exit Management
```

Any unmatched path redirects to `/dashboard`.

---

## Component Hierarchy

```
App
+-- AuthProvider (context)
    +-- BrowserRouter
        +-- LoginPage
        +-- AppLayout
            +-- bg-glow (CSS pseudo-element background)
            +-- orb-container (video orb)
            +-- Navbar
            +-- main.page-content
                +-- [Active Page]
                    +-- PageHeader
                    +-- StatCard(s)
                    +-- InsightCard(s)
                    +-- [Page-specific tables, charts, forms]
```

---

## Design System

All visual primitives are defined as CSS custom properties in `src/styles/index.css`:

- `--glass*` — background values for glassmorphism surfaces
- `--border*` — border opacity values
- `--text-*` — semantic text colours
- `--accent*` — brand blue palette
- `--success`, `--warning`, `--danger`, `--info` — semantic state colours
- `--radius`, `--radius-lg` — border radius scale
- `--shadow`, `--shadow-lg`, `--shadow-glass` — elevation scale
- `--blur`, `--blur-card` — backdrop-filter values
- `--font-brand`, `--font-body` — typography stack
- `--transition` — shared easing function

---

## Deployment

The `deploy.yml` GitHub Actions workflow triggers on every push to `main`:

1. Checks out the repository
2. Sets up Node.js 20
3. Runs `npm install`
4. Runs `npm run build` (outputs to `dist/`)
5. Uploads `dist/` as a GitHub Pages artifact
6. Deploys to the `github-pages` environment

The Vite config sets `base: '/HR_MIS/'` to match the GitHub Pages subpath.
