# Funding Call Notice Board (FundAgencyAI)

A role-based web app for faculty and researchers to view, filter, and track institutional funding calls. The UI is a TypeScript React single-page app (Vite) that uses Firebase for authentication and realtime data storage. The project provides Admin and User dashboards and predefined lists for agencies/departments used across the UI.

## Stack
- **Language(s):** TypeScript (primary), small JS usage
- **Framework / runtime:** React (with Vite)
- **Notable libraries:** firebase (Auth + Realtime Database + Analytics), react-router-dom, recharts, lucide-react

## What this is
A client-side, role-aware notice board where authenticated users can browse funding calls and admins can manage them. Authentication and persistence are provided by Firebase (Realtime Database + Auth). Core types and domain models live in types.ts; app-wide constants (departments/agencies, admin domain) are in constants.ts.

### Key files / symbols
- types.ts — UserRole, FundingCall, Announcement, Notification interfaces
- firebaseConfig.ts — Firebase initialization (getAuth, getDatabase, getAnalytics)
- constants.ts — PREDEFINED_DEPARTMENTS, PREDEFINED_AGENCIES, ADMIN_DOMAIN
- context/AppContext.tsx — AppProvider, authentication and app state hooks (useApp)
- App.tsx — Router, ProtectedRoute and main routing configuration
- pages/*.tsx — Login, Signup, RoleSelection, admin and user dashboard pages
- public/ — PWA manifest and service worker (manifest.json, sw.js)
- package.json — dev scripts (dev/build/preview) using Vite

## How it's organized
```
App.tsx                 # Router, ProtectedRoute wiring
index.tsx               # React entry (createRoot)
firebaseConfig.ts       # Firebase SDK init (auth, database, analytics)
types.ts                # Domain types: User, FundingCall, Announcement
constants.ts            # Predefined departments/agencies and ADMIN_DOMAIN
context/
  AppContext.tsx        # AppProvider, currentUser state, auth helpers
pages/
  Login.tsx             # Firebase auth UI (login)
  Signup.tsx            # Signup flow
  RoleSelection.tsx     # Choose role after signup
  admin/                # Admin dashboard & CRUD UI for funding calls
  user/                 # User dashboard & call listing/filtering
public/
  manifest.json
  sw.js                  # Service worker for PWA behavior
vite.config.ts
package.json
metadata.json
```

How it fits together:
- AppProvider (context/AppContext.tsx) exposes currentUser and app state across the app; components read useApp().
- App.tsx defines routes and a small ProtectedRoute component that enforces authentication and role-based access to /admin and /dashboard paths.
- Firebase (firebaseConfig.ts) is the persistence/auth backend: auth operations and reads/writes go to the Realtime Database (getDatabase).
- types.ts provides the shape for FundingCall records (id, agency, deadline, departments, status, timestamps) used by admin and user pages.

## How to run it (shortest path)
Prerequisites:
- Node.js 18+ and npm (or pnpm/yarn)
- A Firebase project with Realtime Database and Authentication enabled

1. Install dependencies
```bash
git clone https://github.com/shdileep/fundAgencyAI.git
cd fundAgencyAI
npm install
```

2. Configure Firebase
- Option A (quick): Replace the values in `firebaseConfig.ts` with your Firebase project's config object.
- Recommended (safer): Move Firebase config to Vite environment variables and load them in a new `src/firebaseConfig.ts` (example below).

Example .env (Vite uses VITE_ prefix):
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_FIREBASE_DATABASE_URL=...
```

3. Run the dev server
```bash
npm run dev
# open http://localhost:5173 (or the console URL Vite prints)
```

4. Build for production
```bash
npm run build
npm run preview   # serves the built app locally
```

Notes:
- The app currently stores an admin-domain constant in constants.ts (ADMIN_DOMAIN = "@fdc.ac.in"). If you want a configurable admin domain, move that constant into an environment variable and validate it in AppContext.
- There is no standalone Node/Express backend in this repository — data and auth are handled client-side via Firebase. If you need server-side scheduled archiving, consider adding a Firebase Cloud Function (cron) to move expired calls to an archived path instead of relying on client checks.

## Security & cleanup recommendations
- Do not commit production Firebase credentials. Replace the hard-coded `firebaseConfig.ts` with environment-based initialization as shown above.
- Avoid storing user passwords in plain text (types.ts notes this). Use Firebase Auth instead of rolling your own password storage.
- If you plan to add server-side features, factor admin-only operations into callable Cloud Functions or a separate backend.

## Try asking
- Would you like me to (A) move firebaseConfig.ts to environment variables and update imports, or (B) add a .env.example file and instructions for CI deployment?
- Do you want a Cloud Function example to automatically archive expired calls (a scheduled job), or should archiving remain client-driven for now?
- Should I add deployment instructions for Vercel / Netlify (including how to set VITE_ env vars) and a simple GitHub Actions workflow to build and deploy the site?
