# GlobeTrotter — Development Plan

> Personalized travel planning platform. 12-hour hackathon project.

---

## 1. Project Vision

GlobeTrotter is a full-stack travel planning application that enables users to create multi-city trips, build day-wise itineraries with activities, estimate trip budgets, visualize trips on a calendar/timeline, and share completed plans publicly.

The product should feel like a polished, real travel planning tool — not a generic dashboard or AI-generated prototype.

---

## 2. Approved Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI library |
| Vite 8 | Build tool |
| TypeScript 6 | Type safety |
| Tailwind CSS 4 | Styling |
| React Router 7 | Client-side routing |
| Zustand 5 | Client state management |
| TanStack Query 5 | Server state / caching |
| React Hook Form 7 | Form handling |
| Zod 3 | Schema validation |
| Lucide React | Icon library |
| Recharts 3 | Charts / budget visualization |
| Axios | HTTP client |

### Backend

| Technology | Purpose |
|---|---|
| Python 3.14 | Language |
| Django 6.1 | Web framework |
| Django REST Framework 3.18 | API layer |
| SimpleJWT 5.5 | JWT authentication |
| django-cors-headers 4.9 | CORS for React frontend |
| drf-spectacular 0.30 | OpenAPI / Swagger docs |
| psycopg 3.3 | PostgreSQL adapter |
| python-decouple 3.8 | Environment config |
| gunicorn 26 | Production WSGI server |
| whitenoise 6.12 | Static file serving |

### Database

| Technology | Purpose |
|---|---|
| PostgreSQL | Primary database |
| SQLite | Local development fallback |
| Neon | Production PostgreSQL hosting |

### Deployment

| Service | Hosts |
|---|---|
| Vercel | Frontend (React SPA) |
| Render | Backend (Django API) |
| Neon | PostgreSQL database |

---

## 3. Architecture

```
┌─────────────────────────────────────────┐
│            React + TypeScript           │
│   (Pages, Components, Forms, Stores)    │
└─────────────────┬───────────────────────┘
                  │ HTTP (Axios + TanStack Query)
                  ▼
┌─────────────────────────────────────────┐
│         Django REST Framework           │
│   (ViewSets, APIViews, Permissions)     │
├─────────────────────────────────────────┤
│            Serializers / Zod            │
│        (Request/Response validation)    │
├─────────────────────────────────────────┤
│            Service Layer                │
│     (Business logic, calculations)      │
├─────────────────────────────────────────┤
│            Django Models (ORM)          │
├─────────────────────────────────────────┤
│            PostgreSQL (Neon)            │
└─────────────────────────────────────────┘
```

**Modular monolith** — not microservices. All Django apps live in a single project under `backend/apps/`.

### Frontend Architecture

- **Routing**: React Router v7, file-system-inspired flat route structure
- **State**: Zustand for auth/UI state, TanStack Query for all server state
- **API**: Centralized Axios client with JWT interceptors (`src/services/api.ts`)
- **Forms**: React Hook Form + Zod schemas for validation
- **Components**: Layered — `ui/` primitives → domain components → pages

### Backend Architecture

- **Views**: Thin — delegates to service layer
- **Service layer**: `backend/services/` — all business logic
- **Serializers**: Input validation and output shaping
- **URLs**: Versioned under `/api/v1/`
- **Auth**: SimpleJWT (access + refresh tokens)

---

## 4. Folder Structure

### Frontend

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.app.json
├── package.json
└── src/
    ├── main.tsx                    # Entry point (QueryClient provider)
    ├── App.tsx                     # Root component (Router)
    ├── index.css                   # Tailwind + design tokens
    ├── components/
    │   ├── ui/                     # Button, Input, Card, Modal, Badge, Spinner
    │   ├── layout/                 # AppLayout, Sidebar, Header, Footer
    │   ├── forms/                  # FormField, FormInput, FormSelect
    │   ├── trip/                   # TripCard, TripList, TripForm
    │   ├── itinerary/              # ItineraryDay, StopCard, ActivityCard
    │   ├── budget/                 # BudgetSummary, ExpenseRow, BudgetChart
    │   └── discovery/              # CityCard, ActivityCard, SearchBar
    ├── pages/                      # Route-level page components
    ├── services/
    │   └── api.ts                  # Axios client + interceptors
    ├── stores/
    │   └── authStore.ts            # Zustand auth state
    ├── hooks/                      # Custom React hooks
    ├── lib/
    │   └── utils.ts                # Formatting, date helpers, constants
    ├── types/
    │   └── index.ts                # All TypeScript interfaces
    └── routes/
        └── index.ts                # Route constants + helpers
```

### Backend

```
backend/
├── manage.py
├── requirements.txt
├── config/
│   ├── settings.py                 # Django settings (DRF, JWT, CORS, DB)
│   ├── urls.py                     # Root URL config (versioned API)
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── users/                      # Auth, registration, profile
│   ├── trips/                      # Trip CRUD, sharing
│   ├── destinations/               # City/destination data
│   ├── activities/                  # Activity discovery
│   ├── itinerary/                   # Itinerary builder (stops + activities)
│   ├── budget/                      # Expense tracking, budget calculation
│   └── community/                   # Public trips, community posts
├── services/                        # Business logic layer
├── utils/                           # Shared helpers
└── tests/                           # Test infrastructure
```

---

## 5. Route Map

### Frontend Routes

| Route | Page | Auth Required |
|---|---|---|
| `/login` | Login | No |
| `/register` | Registration | No |
| `/dashboard` | Dashboard / Home | Yes |
| `/trips` | My Trips | Yes |
| `/trips/new` | Create Trip | Yes |
| `/trips/:id` | Trip Detail / Itinerary | Yes |
| `/trips/:id/edit` | Edit Trip | Yes |
| `/trips/:id/calendar` | Calendar / Timeline | Yes |
| `/trips/:id/budget` | Budget View | Yes |
| `/discover` | City & Activity Search | Yes |
| `/community` | Community Feed | Yes |
| `/profile` | User Profile | Yes |
| `/public/trips/:slug` | Public Itinerary | No |
| `/admin` | Admin Analytics (optional) | Admin |

---

## 6. API Structure

Base: `/api/v1/`

### Auth (`/api/v1/auth/`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register/` | Register new user |
| POST | `/token/` | Login (get JWT) |
| POST | `/token/refresh/` | Refresh access token |
| GET | `/me/` | Get current user profile |
| PATCH | `/me/` | Update profile |

### Trips (`/api/v1/trips/`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List user's trips |
| POST | `/` | Create trip |
| GET | `/:id/` | Get trip detail |
| PATCH | `/:id/` | Update trip |
| DELETE | `/:id/` | Delete trip |
| POST | `/:id/share/` | Generate public share link |

### Cities (`/api/v1/cities/`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List / search cities |
| GET | `/:id/` | City detail |

### Activities (`/api/v1/activities/`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List / search / filter activities |
| GET | `/:id/` | Activity detail |

### Itinerary — Stops (`/api/v1/itinerary/`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stops/?trip=:id` | List stops for a trip |
| POST | `/stops/` | Add stop to trip |
| PATCH | `/stops/:id/` | Update stop |
| DELETE | `/stops/:id/` | Remove stop |
| GET | `/trip-activities/?stop=:id` | List activities for a stop |
| POST | `/trip-activities/` | Add activity to stop |
| PATCH | `/trip-activities/:id/` | Update trip activity |
| DELETE | `/trip-activities/:id/` | Remove trip activity |

### Budget (`/api/v1/budget/`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/expenses/?trip=:id` | List expenses for trip |
| POST | `/expenses/` | Add expense |
| PATCH | `/expenses/:id/` | Update expense |
| DELETE | `/expenses/:id/` | Delete expense |
| GET | `/summary/?trip=:id` | Budget summary / totals |

### Community (`/api/v1/community/`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/posts/` | List community posts |
| POST | `/posts/` | Share trip to community |

### Public (`/api/v1/public/`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/trips/:slug/` | Get public trip by slug |

---

## 7. Database Entity Plan

### Entity Relationship Diagram

```
User
├── Trip (owner)
│   ├── TripStop (ordered, with dates)
│   │   └── City (FK)
│   ├── TripActivity (through TripStop)
│   │   └── Activity (FK)
│   ├── Expense (categorized costs)
│   └── SharedTrip (public slug)
├── SavedCity (bookmarks)
└── CommunityPost (shared trips)

City
└── Activity (many activities per city)
```

### Core Entities

| Entity | Key Fields |
|---|---|
| **User** | Django default + avatar_url, bio |
| **Trip** | title, description, start_date, end_date, cover_image_url, is_public, slug, status, owner (FK→User) |
| **City** | name, country, country_code, description, image_url, latitude, longitude |
| **TripStop** | trip (FK→Trip), city (FK→City), arrival_date, departure_date, order, notes |
| **Activity** | name, description, city (FK→City), category, estimated_cost, currency, duration_minutes, image_url, rating |
| **TripActivity** | trip_stop (FK→TripStop), activity (FK→Activity), date, start_time, end_time, notes, order, custom_cost |
| **Expense** | trip (FK→Trip), category, description, amount, currency, date |
| **SharedTrip** | trip (FK→Trip), shared_by (FK→User), slug (unique), is_public |
| **SavedCity** | user (FK→User), city (FK→City) |
| **CommunityPost** | author (FK→User), trip (FK→Trip), caption, likes_count |

### Key Constraints

- TripStop.order — unique per trip, determines stop sequence
- TripActivity.order — unique per stop+date, determines activity sequence
- SharedTrip.slug — globally unique for public URLs
- Expense.amount — positive decimal
- TripStop dates must fall within Trip date range
- TripActivity.date must fall within TripStop date range

---

## 8. MVP Scope

### ✅ MUST HAVE (Phase 1–6)

- [ ] Authentication (register, login, JWT)
- [ ] Dashboard (trip overview, stats)
- [ ] Trip creation (title, dates, description)
- [ ] Trip listing (My Trips with status)
- [ ] City search (search + add to trip)
- [ ] Activity search (search + filter by city/category)
- [ ] Itinerary builder (add stops, add activities, drag-to-order)
- [ ] Budget calculation (add expenses, category breakdown, totals)
- [ ] Calendar / timeline view (date-based trip visualization)
- [ ] Public itinerary sharing (shareable link)
- [ ] Responsive UI (mobile-friendly)
- [ ] Deployment (Vercel + Render + Neon)

### 🔶 SHOULD HAVE (if time permits)

- [ ] User profile page
- [ ] Community feed (browse shared trips)
- [ ] Trip filtering & sorting
- [ ] Trip duplication
- [ ] Saved/bookmarked destinations
- [ ] Activity rating display

### ⬜ NICE TO HAVE (stretch goals)

- [ ] Admin analytics dashboard
- [ ] AI-powered activity recommendations
- [ ] Interactive map integration
- [ ] Weather data per city/date
- [ ] Live hotel pricing
- [ ] Live transportation pricing
- [ ] Push notifications
- [ ] Real-time collaboration
- [ ] Trip export (PDF)

---

## 9. Coding Standards

### Frontend

- **Language**: TypeScript — strict mode, no `any`
- **Components**: PascalCase (`TripCard.tsx`)
- **Variables/Functions**: camelCase
- **Files**: PascalCase for components, camelCase for utilities/hooks
- **Components**: Small, focused, reusable. No god-components.
- **Imports**: Use `@/` alias for all src-relative imports
- **Styling**: Tailwind utility classes. Extract to components, not CSS.
- **State**: Zustand for client state, TanStack Query for server state. Never duplicate.
- **Forms**: React Hook Form + Zod. Never use uncontrolled bare inputs.
- **API calls**: Always through `src/services/` — never raw axios in components
- **Linting**: Oxlint (included with Vite scaffold)

### Backend

- **Language**: Python — type hints where helpful
- **Naming**: snake_case for everything
- **Views**: Thin — delegate to service layer
- **Serializers**: Handle all validation and data shaping
- **Service layer**: All business logic in `services/`
- **Models**: Clean, with `__str__`, `Meta.ordering`, proper `related_name`
- **Error handling**: DRF exceptions, consistent error responses
- **URLs**: REST conventions, plural resource names

### Git

```
feat: add trip creation API
fix: correct budget calculation overflow
refactor: extract itinerary service from views
style: adjust card spacing on dashboard
docs: add API endpoint documentation
test: add trip serializer validation tests
chore: update dependencies
```

---

## 10. 12-Hour Execution Timeline

```
Hour 0–1     ██  Foundation + Architecture (THIS PHASE)
Hour 1–2.5   ███  Database models + Auth (register/login/JWT)
Hour 2.5–4   ███  Trip/Cities/Activities APIs + seed data
Hour 3–5     ████  Frontend foundation (layout, routing, auth pages, dashboard)
Hour 4–7     █████  Itinerary builder (stops, activities, day view)
Hour 6.5–8.5 ████  Budget system + Calendar/Timeline view
Hour 8–9     ██  Public sharing
Hour 9–10    ██  Integration testing + bug fixes
Hour 10–10.5 █  Deployment (Vercel + Render + Neon)
Hour 10.5–12 ███  Polish, responsive fixes, demo prep
```

### Critical Path

```
Auth → Trip CRUD → City/Activity APIs → Itinerary Builder → Budget → Calendar → Sharing → Deploy
```

If the itinerary builder slips, everything downstream is at risk. It must be prioritized.

### Parallelizable Work

- Frontend auth pages can be built while backend auth is being completed
- City/Activity seed data can be prepared while Trip API is being built
- Budget UI can be built in parallel with Calendar/Timeline

---

## 11. Technical Risks

| # | Risk | Impact | Probability | Fallback |
|---|---|---|---|---|
| 1 | **PostgreSQL setup fails** (Neon connection issues) | High | Low | Use SQLite for dev + demo, deploy Neon last |
| 2 | **JWT auth integration bugs** (token refresh, CORS) | High | Medium | Test auth flow early, have postman collection |
| 3 | **Itinerary date validation complexity** | Medium | Medium | Simplify: allow overlapping dates, validate client-side only |
| 4 | **Budget calculation edge cases** (currency, rounding) | Low | Low | Single currency (USD) for MVP, multi-currency as stretch |
| 5 | **Frontend/backend integration** (API contract mismatches) | High | Medium | Use TypeScript types matching serializers exactly, test early |
| 6 | **Deployment configuration** (env vars, CORS, static files) | High | Medium | Deploy early (hour 10), have fallback local demo |
| 7 | **Responsive UI** (complex itinerary builder on mobile) | Medium | Medium | Desktop-first, mobile-friendly not mobile-optimized |
| 8 | **Seed data** (need cities/activities to demo) | Medium | Low | Prepare JSON fixture with 20 popular cities + 100 activities |
| 9 | **Time pressure** (scope creep, debugging) | High | High | Strict MVP scope, cut community/admin first |
| 10 | **External API dependency** (if using any) | Medium | Low | No external APIs in MVP — all data is self-seeded |

### Mitigation Strategy

1. **Test auth flow within first 2.5 hours** — don't proceed until login/register works E2E
2. **Deploy skeleton at hour 10** — even if incomplete, prove the pipeline works
3. **Keep seed data ready** — 20 cities, 100 activities in a Django fixture
4. **Frontend/backend contracts** — TypeScript types and DRF serializers must match exactly

---

## 12. Judging Criteria Alignment

| Criteria | How We Address It |
|---|---|
| **Functionality** | Complete trip planning workflow: create → plan → budget → share |
| **Technical execution** | Clean architecture, service layer, typed frontend, proper auth |
| **UI/UX** | Warm light theme, Inter typography, professional travel aesthetic |
| **Innovation** | Day-wise itinerary builder with timeline view, public sharing |
| **Completeness** | Working deployment on Vercel + Render + Neon |
| **Presentation** | Calendar/timeline view is demo-friendly, public share links are shareable |
