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
User (email-based auth)
│
├── Trips (owner)
│    │
│    ├── TripStops (ordered stops per trip)
│    │      │
│    │      └── City (destination master catalog)
│    │             │
│    │             └── Activities (activity master catalog)
│    │
│    ├── TripActivities (activities scheduled in a stop)
│    │      │
│    │      └── Activity (reused master activity)
│    │
│    ├── Expenses (categorized budget items: transport, accommodation, etc.)
│    │
│    └── SharedTrip (public share slug & link)
│
├── SavedCities (bookmarked destinations)
│
└── CommunityPosts (published trip showcase)
```

### Table Definitions & Specifications

| Table | Django App | Key Fields & Types | Indexes | Constraints |
|---|---|---|---|---|
| `users` | `users` | `id`, `email` (unique), `first_name`, `last_name`, `phone`, `city`, `country`, `profile_image`, `is_active`, `is_staff`, `created_at`, `updated_at` | `email` | `UNIQUE(email)` |
| `trips` | `trips` | `id`, `user_id` (FK), `name`, `description`, `cover_image`, `start_date`, `end_date`, `total_budget` (Decimal), `is_public`, `share_slug` (unique), `created_at`, `updated_at` | `(user, -start_date)`, `(start_date, end_date)` | `CHECK(end_date >= start_date)`, `CHECK(total_budget >= 0)`, `UNIQUE(share_slug)` |
| `cities` | `destinations` | `id`, `name`, `country`, `region`, `description`, `image`, `cost_index` (1-5), `popularity_score` (0.0-10.0), `created_at`, `updated_at` | `name`, `(-popularity_score)` | `UNIQUE(name, country)` |
| `saved_cities` | `destinations` | `id`, `user_id` (FK), `city_id` (FK), `created_at` | — | `UNIQUE(user, city)` |
| `trip_stops` | `itinerary` | `id`, `trip_id` (FK), `city_id` (FK), `start_date`, `end_date`, `stop_order`, `transport_cost` (Decimal), `accommodation_cost` (Decimal), `notes`, `created_at`, `updated_at` | `(trip, stop_order)`, `city` | `CHECK(end_date >= start_date)`, `CHECK(transport_cost >= 0)`, `CHECK(accommodation_cost >= 0)`, `UNIQUE(trip, stop_order)` |
| `activities` | `activities` | `id`, `city_id` (FK), `name`, `description`, `category` (enum), `duration_minutes`, `estimated_cost` (Decimal), `image`, `created_at`, `updated_at` | `(city, category)`, `estimated_cost` | `CHECK(estimated_cost >= 0)` |
| `trip_activities` | `itinerary` | `id`, `trip_stop_id` (FK), `activity_id` (FK), `activity_date`, `start_time`, `notes`, `estimated_cost` (Decimal), `activity_order`, `created_at`, `updated_at` | `(trip_stop, activity_date, activity_order)` | `CHECK(estimated_cost >= 0)`, `UNIQUE(trip_stop, activity, activity_date)` |
| `expenses` | `budget` | `id`, `trip_id` (FK), `category` (enum), `amount` (Decimal), `description`, `expense_date`, `created_at`, `updated_at` | `(trip, category)`, `(trip, expense_date)` | `CHECK(amount >= 0)` |
| `shared_trips` | `trips` | `id`, `trip_id` (FK 1:1), `slug` (unique), `created_at`, `updated_at` | `slug` | `UNIQUE(slug)` |
| `community_posts` | `community` | `id`, `user_id` (FK), `trip_id` (FK), `title`, `description`, `created_at`, `updated_at` | `(-created_at)` | — |

### Structural Rationale & Design Choices

1. **Why `TripStop` exists separately from `Trip`**: A trip can span multiple cities (e.g. London → Paris → Rome). `TripStop` encapsulates city-specific dates, order, transport costs, and accommodation costs for each leg of a multi-city journey.
2. **Why `TripActivity` exists separately from `Activity`**: `Activity` acts as a master catalog per city (e.g., "Eiffel Tower Tour"). `TripActivity` represents scheduling that activity into a specific trip stop on a specific date with custom notes and times, enabling high reusability without data duplication.
3. **Why `Expense` exists separately**: Allows flexible line-item expense tracking for budget breakdown (transport, accommodation, meals, activities, shopping) independent of planned itinerary items.
4. **Why `SavedCity` exists separately**: Maintains a clean 1-to-many bookmark relationship between users and destination cities, enforced with composite uniqueness `UNIQUE(user, city)`.
5. **Money representation**: All financial fields (`total_budget`, `transport_cost`, `accommodation_cost`, `estimated_cost`, `amount`) strictly use PostgreSQL `NUMERIC` (`DecimalField` with `max_digits=12, decimal_places=2`) to guarantee accuracy and avoid floating-point inaccuracies.

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
