# Nsangiza Hub — Your Safe Space to Talk

A private, digital psychological and mental-health support platform for Rwanda.
Nsangiza Hub connects people to verified professionals for secure chat, audio and
video sessions; lets users check in with their mood daily; provides moderated
peer-community spaces; and gives professionals and administrators the tools to
run care safely — all as an installable (PWA) app designed to feel native on
small phones.

> **Brand note:** the product name is always **"Nsangiza Hub"** — never renamed.

---

## 1. What the system does

Four audiences use one connected system:

| Audience | Role | What they can do |
| --- | --- | --- |
| **Users** | `USER` | Onboard (consent → preferences → quick assessment), book & join appointments, take daily mood check-ins, message professionals securely, join community groups, follow the newsfeed/notifications |
| **Professionals** | `PROFESSIONAL` | Build a public profile, upload licence/degree documents, set weekly availability, submit for verification, confirm/complete/cancel sessions, manage follow-ups, message clients |
| **Moderators / supervisors** | `PROFESSIONAL` (staff) | Review the verification queue, moderate community content, run safeguarding case work |
| **Administrators** | `ADMIN` | Full control: users, professionals & verification, resources, community reports, safeguarding, audit logs and analytics |

Product philosophy: **safe, private, human-first**.

- **Trust by verification** — every listed professional has had documents reviewed by an admin.
- **Least-privilege data access** — professionals see aggregated summaries by default; check-ins are private to the user and their care team.
- **Crisis safety built in** — emergency numbers (Rwanda National Police 112, Ambulance 912) are surfaced in the footer, public pages and relevant flows.
- **Community is moderated** — group rules, report/dismiss moderation and hide/restore for harmful posts.

---

## 2. Architecture

```
┌────────────────────────────────────────────────────────────┐
│  Frontend (SPA, installable PWA)   → Vercel (static)        │
│  React 19 · Vite 8 · TypeScript · Tailwind CSS              │
│  React Router 7 · TanStack Query 5 · Radix UI · sonner      │
│  Role-based guards → /  /app  /professional  /admin         │
└───────────────────────────┬────────────────────────────────┘
                            │  HTTPS  (VITE_API_BASE_URL)
┌───────────────────────────▼────────────────────────────────┐
│  API (Express 4 + Mongoose 8 + Zod 4)  → Render (web)       │
│  JWT access token (Bearer) + httpOnly refresh cookie        │
│  Routes under /api/v1  ·  health at /health                 │
└───────────────────────────┬────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  MongoDB Atlas │
                    └────────────────┘
```

- Local dev: frontend `http://localhost:5173`, API `http://localhost:4000`.
- Production: frontend on Vercel, API on Render, database on MongoDB Atlas.
- Verification uploads land in `server/uploads/documents/` and are streamed only
  through the authenticated `GET /api/v1/documents/:fileName` route.

---

## 3. Tech stack

**Frontend** (`/`)
- React 19, Vite 8, TypeScript, Tailwind CSS 3, Oxlint
- React Router 7 (route guards + role redirects)
- TanStack Query 5 (server state, invalidation, one `queryClient`)
- Radix UI primitives · `sonner` toasts · `lucide-react`
- PWA via `vite-plugin-pwa` (service worker, offline fallback, manifest, shortcuts)
- Build-time SEO plugin: canonical/OG/JSON-LD injection + `sitemap.xml` + `robots.txt`

**Backend** (`/server`)
- Node + Express 4 + TypeScript (dev with `tsx watch`, prod with `node dist/index.js`)
- MongoDB via Mongoose 8
- Zod 4 validation · `bcryptjs` hashing · JWT access/refresh auth
- `morgan` logging · credentialed `cors` allowlist · security headers · rate limiting

---

## 4. Repository layout

```
.
├── index.html, vite.config.ts, vercel.json, render.yaml
├── .env.example               # frontend build-time vars
├── public/                    # manifest, icons, offline.html, robots.txt
├── src/
│   ├── main.tsx               # providers: QueryClient, Auth, Tooltip, Toaster
│   ├── router/                # guards.tsx, index.tsx
│   ├── layouts/               # PublicLayout, AppLayout (mobile shell)
│   ├── components/            # ui/*, nav/*, Brand, ProviderCard…
│   ├── hooks/ services/ lib/ config/
│   └── pages/public|user|professional|admin
└── server/
    ├── src/
    │   ├── index.ts, app.ts, constants.ts
    │   ├── config/env.ts, lib/{errors,response,db}.ts
    │   ├── middleware/{auth,error,security,rateLimit}.ts
    │   ├── models/            # Mongoose models
    │   ├── routes/            # routers mounted at /api/v1/…
    │   └── seed/              # demo data + reset
    ├── .env.example
    └── uploads/documents      # runtime verification uploads (gitignored)
```

---

## 5. Roles & access control

Auth uses a short-lived **JWT access token** (Bearer header) plus an httpOnly
**refresh-token cookie**. Guarding is enforced twice: **client-side** (route
guards + conditional UI) and **server-side** (`requireAuth`, `requireRole`,
ownership/IDOR checks).

- `requireAuth` — validates the Bearer token, attaches `req.userId`.
- `requireRole(...)` — role gate.
- Ownership checks — e.g. appointments only by the user or the assigned professional.
- Route guards (`src/router/guards.tsx`): `LandingRoute`, `RoleRoute`, `OnboardingRoute`.

---

## 6. Feature inventory

### Public (no login)
Landing page, How it works, Safety notice, Emergency contacts, Contact/support,
browse professionals (search, provider type, city, specialisations, weekly
availability + slot-aware booking dialog), resource library.

### User dashboard & onboarding (`/app`, `/onboarding`)
- Onboarding wizard: consent → preferences → quick assessment (with safety flag).
- **Check-in** — daily mood, contributing factors, free note, wellbeing trend.
- **Appointments** — request, upcoming/past, reschedule/cancel, type-aware join.
- **Messages** — secure conversations, unread counts, mark read, report.
- **Community** — groups, join/leave, posts with reactions, replies, report.
- Notifications feed, profile & settings, resources, help pages.

### Professional workspace (`/professional`)
Profile & offering, document upload for verification, submit for verification,
dashboard, appointment state machine, least-privilege client list/detail,
follow-ups, messages.

### Admin (`/admin`)
Dashboard counts, users, professionals & verification queue (document review),
community report moderation, resource management, safeguarding case workflow,
audit logs, analytics.

---

## 7. API reference

Base URL locally: `http://localhost:4000/api/v1`.

### Auth (`/auth`)
| Method / path | Notes |
| --- | --- |
| `POST /register` | Creates user (+ `Professional` draft for `PROFESSIONAL`) · rate-limited |
| `POST /login` | Sets refresh cookie, returns access token + user · rate-limited |
| `POST /refresh` | New access token from cookie |
| `POST /logout` | Clears refresh cookie |
| `GET /me` | Current user |

### Users (`/users`)
`PATCH /me` · `POST /onboarding/consent|preferences|assessment` · `GET /onboarding/status` · `POST /check-ins` · `GET /check-ins` · `GET /wellbeing/trend`

### Professionals — public (`/professionals`)
`GET /` (search/filter/paginate, verified only) · `GET /cities` · `GET /:id` · `GET /:id/availability`

### Professional self-service (`/professional`)
`GET /me` · `PATCH /me` · `POST /me/submit` · `POST /me/documents` · `DELETE /me/documents/:docId` · `GET /dashboard` · `GET /clients` · `GET /clients/:id`

### Matching (`/matching`)
`GET /recommendations`

### Appointments (`/appointments`)
`GET /` · `GET /upcoming` · `POST /` · `PATCH /:id` · `PATCH /:id/status` · `DELETE /:id`
Transitions are enforced server-side (terminal states are immutable); the other party is notified on every change.

### Conversations (`/conversations`)
`GET /` · `POST /` · `GET /:id` · `GET /:id/messages` · `POST /:id/messages` · `PATCH /:id/read` · `POST /:id/report`

### Resources (`/resources`)
`GET /` · `GET /featured` · `GET /:slug` · `GET /categories`

### Community (`/community`)
`GET /groups` · `GET /groups/mine` · `GET /groups/:id` · `GET|POST /groups/:id/posts` · `POST /posts/:id/comments` · `POST /posts/:id/reactions` · `POST /groups/:id/join|leave` · `POST /posts/:id/report`

### Notifications (`/notifications`)
`GET /` · `PATCH /:id/read` · `PATCH /read-all`

### Follow-ups (`/follow-ups`) · `GET /` · `PATCH /:id/complete`

### Emergency (`/emergency`) · `GET /contacts`

### Admin (`/admin`)
`GET /dashboard` · `GET /users` · `PATCH /users/:id/status` · `GET /professionals` · `GET /professionals/pending` · `PATCH /professionals/:id/verification` · `GET /safeguarding` · `PATCH /safeguarding/:id` · `GET|POST /resources` · `PATCH|DELETE /resources/:id` · `GET /community/reports` · `PATCH /community/posts/:id/moderate` · `GET /analytics` · `GET /audit-logs`

### Documents & health
- `GET /documents/:fileName` — stream an uploaded verification document (authenticated).
- `GET /health` and `GET /api/v1/health` — service + database status (used by Render).

---

## 8. Data model (`server/src/models/`)

| Collection | Key contents |
| --- | --- |
| `User` | role, profile, onboarding state, notification settings |
| `Professional` | public profile, `availability[]`, `documents[]`, `verification`, `reviews` |
| `Appointment` | user↔professional, date/endDate, type, status, joinToken, cancellation |
| `Conversation` / `Message` | participants, unread map, message kinds, report flag |
| `CheckIn` | mood, factors[], note, createdAt |
| `CommunityGroup` / `CommunityPost` | membership, counts, reactions, comments, report/moderate flags |
| `Resource` | articles with categories, language, review/publish state |
| `Notification` | per-user feed with deep links |
| `FollowUp` | professional↔user follow-ups, dueAt, status |
| `Assessment` | onboarding assessment + safety flags |
| `SafeguardingCase` | admin case workflow |
| `AuditLog` | verification & moderation trail |

---

## 9. Privacy & security notes

- Passwords hashed with `bcryptjs`; access tokens short-lived, refresh token in an httpOnly cookie.
- Server-side authorisation on every sensitive route (role + ownership/IDOR guards).
- Professional access to client data follows least privilege — summaries first.
- Check-ins are private to the user and their supporting professionals.
- Uploads are size/mime validated, stored on disk outside the public static root
  and streamed only through the authenticated documents route.
- Security headers (`nosniff`, frame deny, referrer policy, HSTS in production)
  and rate limiting on authentication endpoints.
- No real SMS/email delivery — audio/video links are coordinated inside secure messages.

---

## 9b. Data model note / limitations

- **Ephemeral uploads on Render:** the free Render plan has an ephemeral
  filesystem, so verification uploads are lost on redeploy/restart. Attach a
  Render disk (paid) or move uploads to object storage (S3/Cloudinary) for
  production.
- **Cross-site cookies:** when frontend (Vercel) and API (Render) are on
  different sites, the refresh cookie must be `SameSite=None; Secure=true`
  (see `COOKIE_SAME_SITE` / `COOKIE_SECURE` below).

---

## 10. Getting started (local)

Requirements: **Node ≥ 20**, MongoDB (local or Atlas).

```bash
# 1. Backend
cd server
cp .env.example .env          # then edit .env
npm install
npm run seed                  # first run only; seed:reset to drop & reseed
npm run dev                   # http://localhost:4000

# 2. Frontend (new terminal, repo root)
npm install
cp .env.example .env          # optional; leave VITE_API_BASE_URL empty for the proxy
npm run dev                   # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:4000`, so
the two dev servers work together without CORS configuration.

---

## 10b. Environment variables

### Frontend (`.env` — build-time, `VITE_` prefixed only)

| Variable | Example | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `https://nsangiza-api.onrender.com/api/v1` | API base URL. Empty in dev to use the Vite proxy. |
| `VITE_SITE_URL` | `https://nsangiza.vercel.app` | Public origin for canonical URLs, OG tags and `sitemap.xml`. |

### Backend (`server/.env`)
| Variable | Example | Notes |
| --- | --- | --- |
| `NODE_ENV` | `production` | `production` enables strict env validation + HSTS. |
| `PORT` | `4000` | Render injects this automatically. |
| `MONGODB_URI` | `mongodb+srv://…/nsangiza_hub?retryWrites=true&w=majority` | **Required in production.** Include the database name. |
| `JWT_ACCESS_SECRET` | *(random, ≥ 32 chars)* | **Required in production.** |
| `JWT_REFRESH_SECRET` | *(random, ≥ 32 chars)* | **Required in production.** |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access-token lifetime. |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Refresh-token lifetime. |
| `CLIENT_ORIGIN` | `https://nsangiza.vercel.app` | Comma-separated CORS allowlist. |
| `COOKIE_SAME_SITE` | `none` | `none` for cross-site (Vercel↔Render); `lax` for local. |
| `COOKIE_SECURE` | `true` | `true` whenever `COOKIE_SAME_SITE=none`. |
| `COOKIE_DOMAIN` | *(optional)* | e.g. `.your-domain.com` to share the cookie across subdomains. |

---

## 10c. Seeding

```bash
cd server
npm run seed         # insert demo data (skips if already seeded)
npm run seed:reset   # DROP the seed collections, then re-insert
```

The seed script uses `MONGODB_URI` from `server/.env`, so to seed MongoDB Atlas
just point `MONGODB_URI` at your Atlas cluster and run `npm run seed:reset`.

> Some networks block DNS **SRV** lookups. If `mongodb+srv://…` fails with
> `querySrv ECONNREFUSED`, use the direct shard-list connection string instead
> (`mongodb://user:pass@shard-00-00…:27017,shard-00-01…:27017,shard-00-02…:27017/db?ssl=true&replicaSet=…&authSource=admin`).

---

## 11. Deployment

Three pieces: **MongoDB Atlas** (database) → **Render** (API) → **Vercel**
(frontend). Deploy in that order and wire the URLs together at the end.

### 11.1 MongoDB Atlas
1. Create a free cluster and a database user.
2. Add a network access rule (Render's egress IPs, or `0.0.0.0/0` to start).
3. Copy the connection string and **add the database name**:
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/nsangiza_hub?retryWrites=true&w=majority`
4. Seed from your machine: set `server/.env` `MONGODB_URI` to that string and run
   `npm run seed:reset`.

### 11.2 Render (API)
- **Blueprint:** create a new Blueprint from this repo — `render.yaml` provisions
  the service (`rootDir: server`, build `npm install && npm run build`, start
  `npm run start`, health check `/health`).
- **Or manually:** Web Service → root directory `server` → build
  `npm install && npm run build` → start `npm run start` → health check `/health`.
- Set environment variables:
  - `NODE_ENV=production`
  - `MONGODB_URI=<Atlas string with /nsangiza_hub>`
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (long random strings)
  - `CLIENT_ORIGIN=https://<your-vercel-domain>` (add custom domains too, comma-separated)
  - `COOKIE_SAME_SITE=none`, `COOKIE_SECURE=true`
- Note the Render URL, e.g. `https://nsangiza-hub-api.onrender.com`.

### 11.3 Vercel (frontend)
- Import this repository. Vercel auto-detects Vite; `vercel.json` sets the build,
  the SPA rewrite and cache headers.
- Set environment variables:
  - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api/v1`
  - `VITE_SITE_URL=https://<your-vercel-domain>`
- Deploy. Then update Render's `CLIENT_ORIGIN` to the final Vercel domain and
  redeploy the API.

---

## 12. Demo accounts

Password for all demo accounts: `Nsangiza@2026`.

| Role | Email |
| --- | --- |
| User | `demo@nsangiza.rw` |
| Professional | `prof@nsangiza.rw` |
| Admin | `admin@nsangiza.rw` |
| Moderator | `moderator@nsangiza.rw` |
| Supervisor | `supervisor@nsangiza.rw` |

---

## 13. Scripts

**Frontend** (`/`)
| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server (proxies `/api` + `/uploads`) |
| `npm run build` | Type-check + production build (also writes `sitemap.xml`/`robots.txt`) |
| `npm run lint` | Oxlint |
| `npm run preview` | Preview the production build |

**Backend** (`/server`)
| Command | Description |
| --- | --- |
| `npm run dev` | `tsx watch src/index.ts` |
| `npm run build` | `tsc` → `dist/` |
| `npm run start` | `node dist/index.js` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed` / `seed:reset` | Insert / reset demo data |
