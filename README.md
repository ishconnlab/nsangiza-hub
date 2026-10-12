# Nsangiza Hub â€” Your Safe Space to Talk

A private, digital psychological and mental-health support platform for Rwanda. Nsangiza Hub connects people to verified professionals for secure chat, audio and video sessions; lets users check in with their mood daily; provides moderated peer-community spaces; and gives professionals and administrators the tools to run care safely â€” all as an installable (PWA) app designed to feel native on small phones.

> **Brand note:** the product name is always **"Nsangiza Hub"** â€” never renamed.

---

## 1. What the system does

Four audiences use one connected system:

| Audience | Role | What they can do |
| --- | --- | --- |
| **Users** | `USER` | Onboard (consent â†’ preferences â†’ quick assessment), book & join appointments, take daily mood check-ins, message professionals securely, join community groups, follow newsfeed/notifications |
| **Professionals** | `PROFESSIONAL` | Build a public profile, upload licence/degree documents, set weekly availability, submit for verification, confirm/complete/cancel sessions, manage follow-ups, message clients |
| **Moderators / supervisors** | `PROFESSIONAL` (staff) | Review the verification queue, moderate community content, run safeguarding case work |
| **Administrators** | `ADMIN` | Full control: users, professionals & verification, resources, community reports, safeguarding, audit logs and analytics |

The product philosophy is **safe, private, and human-first**:

- Trust by verification â€” every listed professional is someone whose documents have been reviewed (documents are uploaded, stored on disk and opened by admins during review).
- Least-privilege data access â€” professionals see only aggregated summaries of clients (no raw clinical notes by default); check-ins are private to the user and their care team.
- Crisis safety built in â€” emergency help numbers (Rwanda National Police 112, Ambulance 912) are surfaced in the footer, public pages, and relevant flows.
- Community is moderated â€” group rules, report/dismiss moderation and hide/restore for harmful posts.

---

## 2. Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Frontend  (single-page app, installable PWA)               â”‚
â”‚  React 19 + Vite 8 + TypeScript + Tailwind CSS              â”‚
â”‚  React Router 7 Â· TanStack Query 5 Â· Radix UI Â· sonner      â”‚
â”‚  Role-based router guards â†’  / , /app, /professional, /adminâ”‚
â”‚  Native-style mobile shell: bottom taskbar + bottom sheet   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                           â”‚  /api  and  /uploads   (Vite proxy in dev)
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  API  (Express 4 + Mongoose 8 + Zod 4)   http://localhost:4000â”‚
â”‚  JWT access token (Bearer) + refresh cookie Â· bcryptjs       â”‚
â”‚  Routes mounted under /api/v1  â†’  auth, users, professionals,â”‚
â”‚  matching, appointments, conversations, resources, community,â”‚
â”‚  notifications, follow-ups, emergency, admin, per-professionalâ”‚
â”‚  Static file serving for uploaded documents at /uploads      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                           â”‚
              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
              â”‚  MongoDB                â”‚
              â”‚  (nsangiza_hub, local)  â”‚
              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Frontend dev server: `http://localhost:5173`
- API dev server: `http://localhost:4000`
- File uploads land in `server/uploads/documents/` and are served at `/uploads/documents/<file>`

---

## 3. Tech stack

**Frontend** (`D:\Hub`)
- React 19, Vite 8, TypeScript, Tailwind CSS 3, Oxlint
- React Router 7 (with data-less route guards + role redirects)
- TanStack Query 5 (server state, invalidation, one `queryClient`)
- Radix UI primitives (dialog, select, tabs, radio, checkbox, avatar, tooltipâ€¦)
- `sonner` toasts Â· `class-variance-authority` + `tailwind-merge` Â· `lucide-react`
- PWA via `vite-plugin-pwa` (service worker, offline fallback, manifest, shortcuts)

**Backend** (`D:\Hub\server`)
- Node + Express 4 + TypeScript (run with `tsx watch`)
- MongoDB via Mongoose 8 (14 collections, embedded subdocuments)
- Zod 4 validation, `bcryptjs` password hashing, JWT access/refresh auth
- `morgan` logging, `cors` (credentialed), cookie parsing, `express.static` for uploads

---

## 4. Repository layout

```
D:/Hub
â”œâ”€â”€ index.html, postcss.config.js, tailwind.config.js, vite.config.ts
â”œâ”€â”€ public/                    # manifest, icons, offline.html, robots.txt
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ main.tsx              # providers: QueryClient, Auth, Tooltip, Toaster
â”‚   â”œâ”€â”€ router/               # guards.tsx (LandingRoute/RoleRoute), index.tsx
â”‚   â”œâ”€â”€ layouts/              # PublicLayout, AppLayout (mobile shell)
â”‚   â”œâ”€â”€ components/           # ui/* (radix-based), nav/* (mobile shell), Brandâ€¦
â”‚   â”œâ”€â”€ hooks/                # auth-context.ts + AuthProvider.tsx
â”‚   â”œâ”€â”€ services/             # TanStack hooks per resource (users, appointmentsâ€¦)
â”‚   â”œâ”€â”€ lib/                  # api client, constants, format, utils
â”‚   â”œâ”€â”€ config/env.ts
â”‚   â”œâ”€â”€ pages/public|user|professional|admin
â”‚   â””â”€â”€ types/index.ts
â””â”€â”€ server/
    â”œâ”€â”€ src/
    â”‚   â”œâ”€â”€ index.ts, app.ts, constants.ts
    â”‚   â”œâ”€â”€ config/env.ts, lib/errors.ts, lib/response.ts, lib/db.ts
    â”‚   â”œâ”€â”€ middleware/auth.ts, middleware/error.ts
    â”‚   â”œâ”€â”€ models/           # 14 Mongoose models
    â”‚   â”œâ”€â”€ routes/           # 13 routers (mounted at /api/v1/â€¦)
    â”‚   â””â”€â”€ seed/             # demo data + reset
    â””â”€â”€ uploads/documents     # professional verification uploads (runtime)
```

---

## 5. Roles & access control

Authentication uses a short-lived **JWT access token** (Bearer header) plus a **refresh-token cookie**. Guarding is enforced twice: **client-side** (route guards + conditional UI) and **server-side** (`requireAuth`, `requireRole`, and ownership checks).

- `requireAuth` â€” validates Bearer token, attaches `req.userId`.
- `requireRole('PROFESSIONAL' | 'ADMIN')` â€” role gate.
- Ownership checks â€” e.g. appointments only by the user or the assigned professional; professional routes resolve the profile via `{ user: req.userId }`.
- Route guards (`src/router/guards.tsx`):
  - `LandingRoute` â€” authenticated users hitting `/` are sent to their dashboard (incomplete `USER` â†’ `/onboarding`).
  - `RoleRoute` â€” nested route groups `/app`, `/professional`, `/admin` load only for the right role and **redirect** otherwise (a `USER` can no longer land on a blank professional page).
  - `OnboardingRoute` â€” non-`USER` roles never see onboarding.

---

## 6. Feature inventory

### Public (no login)
- Landing page, How it works, Safety notice, Emergency contacts, Contact/support
- Browse professionals (search, provider type, city, specializations) incl. weekly availability and **slot-aware booking dialog**
- Resource library (articles, categories, featured, reading time)

### User dashboard & onboarding (`/app`, `/onboarding`)
- Onboarding wizard: **consent â†’ preferences â†’ quick assessment** (with safety flag), progress status
- **Check-in** â€” daily mood (5-point scale), contributing factors, free note (â‰¤500 chars), personal wellbeing trend and most-common factors; available to the user's care team
- **Appointments** â€” request from a professional's page, upcoming/past tabs, detail dialog, reschedule or cancel with confirmations, type-aware "join" (secure chat â†’ messages, call â†’ messages receive the link, in-person â†’ location)
- **Messages** â€” secure conversations with a professional, unread counts, mark read, report conversation
- **Community** â€” group list, join/leave, per-group posts with **reactions (supportive/thoughtful/grateful)**, replies, report-to-moderation, moderated badges
- Notifications feed, profile & settings, resources, help pages

### Professional workspace (`/professional`)
- **Profile** â€” basics, offering (languages, support areas, session types, fee RWF), availability template (day Ã— start/end, enabled)
- **Document upload for verification** â€” licence / degree certificate (PDF/JPG/PNG/WebP â‰¤ 5 MB), stored on disk, listed with status, viewable by admins; deletion locked once verified
- **Submit for verification** â€” requires â‰¥1 uploaded document; admin reviews and decides
- **Dashboard** â€” today's appointments, pending requests, unread messages, follow-ups, weekly/completed sessions, profile completeness
- **Appointments** â€” request queue, confirm/complete/cancel/no-show/reschedule (state machine enforced server-side)
- **Clients** â€” aggregated, least-privilege client list and client detail (appointments summary, conversation, follow-ups)
- **Follow-ups** â€” pending/upcoming list, mark complete

### Admin (`/admin`)
- Dashboard (counts: users, professionals, verification queue, sessions, reports, safeguarding, resources, groups)
- Users (list/search, suspend/activate), Professionals (filter by verification status, review documents, approve/suspend), Pending queue
- Community reports â€” **dismiss report**, hide/restore post
- Resources â€” create/edit/publish/delete
- Safeguarding case workflow (statuses + actions), audit logs, analytics (date-grouped aggregates)

---

## 7. API reference

All routes under `http://localhost:4000/api/v1`.

### Auth (`/auth`)
| Method / path | Notes |
| --- | --- |
| `POST /register` | Creates user (+ `Professional` draft for `PROFESSIONAL` role) |
| `POST /login` | Sets refresh cookie, returns access token + user |
| `POST /refresh` | New access token from cookie |
| `POST /logout` | Clears refresh cookie |
| `GET /me` | Current user |

### Users (`/users`)
- `PATCH /me` â€” profile update
- `POST /onboarding/consent`, `POST /onboarding/preferences`, `POST /onboarding/assessment`, `GET /onboarding/status`
- `POST /check-ins`, `GET /check-ins`, `GET /wellbeing/trend`

### Professionals (public) (`/professionals`)
- `GET /` (search/filter/paginate, verified only), `GET /cities`, `GET /:id`, `GET /:id/availability`

### Professional self-service (`/professional`)
- `GET /me`, `PATCH /me`, `POST /me/submit`, `POST /me/documents`, `DELETE /me/documents/:docId`
- `GET /dashboard`, `GET /clients`, `GET /clients/:id`

### Matching (`/matching`)
- `GET /recommendations`

### Appointments (`/appointments`)
- `GET /` (user) / `GET /professional/appointments` â€” own sessions
- `GET /upcoming` Â· `POST /` (validates: future date, approved active professional, no overlap, within availability) Â· `PATCH /:id` (reschedule/cancel) Â· `PATCH /:id/status` (state machine) Â· `DELETE /:id`
  - Transitions enforced: user â†’ cancel/reschedule; professional â†’ confirm/complete/cancel/no-show/reschedule; terminal statuses immutable; notifications to the other party on every change.

### Conversations (`/conversations`)
- `GET /`, `POST /` (start with a professional), `GET /:id`, `GET /:id/messages`, `POST /:id/messages`, `PATCH /:id/read`, `POST /:id/report`

### Resources (`/resources`) Â· `GET /`, `GET /featured`, `GET /:slug`, `GET /categories`

### Community (`/community`)
- `GET /groups`, `GET /groups/mine`, `GET /groups/:id`, `GET|POST /groups/:id/posts`
- `POST /posts/:id/comments`, `POST /posts/:id/reactions` (toggle, per-kind counts + `my`), `POST /groups/:id/join`, `POST /groups/:id/leave`, `POST /posts/:id/report`

### Notifications (`/notifications`) Â· `GET /`, `PATCH /:id/read`, `PATCH /read-all`

### Follow-ups (`/follow-ups`) Â· `GET /`, `PATCH /:id/complete`

### Emergency (`/emergency`) Â· `GET /contacts` (crisis help numbers)

### Admin (`/admin`)
- `GET /dashboard`, `GET /users`, `PATCH /users/:id/status`
- `GET /professionals`, `GET /professionals/pending`, `PATCH /professionals/:id/verification`
- `GET /safeguarding`, `PATCH /safeguarding/:id`
- `GET|POST /resources`, `PATCH|DELETE /resources/:id`
- `GET /community/reports`, `PATCH /community/posts/:id/moderate` (`hidden` and/or `resolve`)
- `GET /analytics`, `GET /audit-logs`

### File serving
- `GET /uploads/documents/<file>` â€” uploaded verification documents (express static, no auth).

---

## 8. Data model (`server/src/models/`, MongoDB `nsangiza_hub`)

| Collection | Key contents |
| --- | --- |
| `User` | role, profile, onboarding state, notification settings |
| `Professional` | public profile, `availability[]` (template), `documents[]` (label/status/fileName), `verification` (status/documents/review), `onboarding`, `reviews` |
| `Appointment` | userâ†”professional, date/endDate, type, status, joinToken, cancelledBy, notifications on every transition |
| `Conversation` / `Message` | participants, unread map, message kinds (text/emoji/audio/attachment/system), report flag |
| `CheckIn` | mood, factors[], note, createdAt |
| `CommunityGroup` / `CommunityPost` | membership, counts; posts carry `reactions` (counts), `reactedBy` (per-kind ObjectIds), `comments[]`, report/moderate flags |
| `Resource` | articles with categories, language, review/publish state |
| `Notification` | per-user feed with deep links |
| `FollowUp` | professionalâ†”user follow-ups, dueAt, status |
| `Assessment` | onboarding assessment + safety flags |
| `SafeguardingCase` | admin case workflow (actions, notes) |
| `AuditLog` | admin verification & moderation trail |

---

## 9. Privacy & security notes

- Passwords hashed with `bcryptjs`; JWT access tokens short-lived, refresh in an httpOnly-style cookie.
- Authorisation checks happen server-side for every sensitive route (role + ownership/IDOR guards).
- Professional access to client data follows **least privilege** â€” summaries and aggregated info first.
- Check-ins are private to the user and their supporting professionals; community posts are public within an authenticated, moderated space.
- Uploads: size/mime validated (â‰¤ 5 MB, base64 JSON), stored outside the API, served read-only; `.gitignore`d runtime folder.
- No real SMS/email delivery â€” email is collected server-side (outbox pattern); audio/video links are coordinated inside secure messages (no embedded WebRTC).

---

## 10. Getting started

Requirements: Node â‰¥ 20, a local MongoDB at `mongodb://127.0.0.1:27017` (or set `MONGODB_URI`).

```bash
# 1. Backend
cd server
npm install
npm run dev          # http://localhost:4000  (tsx watch)

# 2. Seed demo data (once)
npm run seed         # or npm run seed:reset

# 3. Frontend (new terminal)
cd ..                # back to D:/Hub
npm install
npm run dev          # http://localhost:5173  (proxies /api + /uploads â†’ 4000)
```

Vite proxies `/api` and `/uploads` to `http://localhost:4000`, so both dev servers run side by side with no CORS friction. In production the frontend is built and the API serves the static client + uploads.

---

## 11. Demo accounts

Every seeded account uses the password **`Nsangiza@2026`**:

| Role | Email |
| --- | --- |
| User | `demo@nsangiza.rw` |
| Professional | `prof@nsangiza.rw` (plus `p2@â€¦p15@example.rw`) |
| Admin | `admin@nsangiza.rw` |
| Moderator | `moderator@nsangiza.rw` |
| Supervisor | `supervisor@nsangiza.rw` |

---

## 12. Internationalisation (i18n)

Core flows are translation-ready for **English, Kinyarwanda and French** (language selection is stored per user). Longer admin/reference copy is deliberately English-only.

---

## 13. PWA / mobile

- Installable (manifest, icons, offline fallback) with `display: standalone`, portrait orientation and app shortcuts for **Check-in** and **Messages**.
- Small screens (< 1024 px) get a native-app shell: floating bottom taskbar with active-tab pill, a bottom-sheet "More" panel, per-tab scroll memory, offline strip, safe-area insets and tap feedback; desktop keeps the full sidebar.
- Service worker precaches the app shell and caches professional/resource APIs (network-first).

---

## 14. Useful commands

```bash
# Frontend (D:/Hub)
npm run dev          # dev server
npm run build        # typeScript check (tsc -b) + production build
npm run lint         # oxlint
npm run preview      # preview the production build

# Backend (D:/Hub/server)
npm run dev          # tsx watch dev server
npm run typecheck    # tsc --noEmit
npm run build        # compile to dist/
npm run seed         # seed demo data
npm run seed:reset   # wipe + reseed
```

---

## 15. Safer engineering conventions (as built)

- Every data-changing appointment action notifies the other party and enforces a **transition matrix** (terminal states are immutable).
- Community reactions are **one per user per kind per post** and toggle atomically server-side.
- Booking validates the chosen time against the professional's **availability template** and **existing overlap**; the frontend offers only generated slot times when the template is set.
- Report/dismiss + hide/restore give admins a full moderation loop; audit logs capture verification and moderation decisions.
