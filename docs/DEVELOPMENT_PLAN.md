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

- **Views**: Thin — delegates to service layer (`backend/services/trip_service.py`)
- **Service layer**: `backend/services/` — encapsulates business logic, ownership checks, and querysets
- **Serializers**: Input validation, date range validation, and calculated properties (`status`, `destination_count`)
- **URLs**: Versioned under `/api/v1/`
- **Auth**: SimpleJWT (access + refresh tokens)

### Trip Status & Ownership Logic

- **Status Calculation (Source of Truth)**:
  - `end_date < today` → `COMPLETED`
  - `start_date <= today <= end_date` → `ONGOING`
  - `start_date > today` → `UPCOMING`
- **Ownership Isolation**:
  - `create_user_trip(user, data)` explicitly binds `user = request.user`.
  - All read/update/delete operations filter by `user = request.user` (returning `404 Not Found` for unauthorized attempts).

### TanStack Query Caching Strategy

- `queryKey: ['trips']` — User's trip list
- `queryKey: ['trip', id]` — Single trip detail
- Mutations automatically invalidate `['trips']` and `['trip', id]` on create, edit, or delete.

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

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| GET | `/` | List / search destination cities | `search`, `country`, `region`, `cost_index`, `ordering` (`-popularity_score`, `name`, `cost_index`), `page` |
| GET | `/:id/` | City detail | — |

### Activities (`/api/v1/activities/`)

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| GET | `/` | List / search city activities | `search`, `city`, `category`, `min_cost`, `max_cost`, `min_duration`, `max_duration`, `ordering` (`name`, `estimated_cost`, `duration_minutes`), `page` |
| GET | `/:id/` | Activity detail | — |

### Itinerary & Stops (`/api/v1/`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/trips/:id/itinerary/` | Retrieve complete itinerary (trip + ordered stops + scheduled activities) |
| POST | `/trips/:id/stops/` | Add a city stop to trip |
| PATCH | `/stops/:id/` | Update stop dates, costs, or notes |
| DELETE | `/stops/:id/` | Delete stop (cascades activities & normalizes stop order) |
| PATCH | `/stops/reorder/` | Reorder stops array for a trip |
| POST | `/stops/:id/activities/` | Schedule catalog activity in city stop |
| PATCH | `/trip-activities/:id/` | Update scheduled activity date, time, cost, or notes |
| DELETE | `/trip-activities/:id/` | Delete scheduled activity |
| PATCH | `/trip-activities/reorder/` | Reorder scheduled activities within a stop |

### Itinerary Architecture & Validation Rules

- **Strict Validation Rules**:
  - `start_date >= trip.start_date` AND `end_date <= trip.end_date` AND `start_date <= end_date`.
  - **Sequential Non-Overlapping Stops**: Rejects overlapping date ranges for distinct stops in a trip.
  - **City Matching Enforcement**: `activity.city_id == stop.city_id`. Rejects adding an activity from an unrelated city.
  - **Activity Date Range**: `stop.start_date <= activity_date <= stop.end_date`.
  - **Cost Copying**: Master `activity.estimated_cost` copied to `TripActivity` on creation to freeze planned cost.
- **N+1 Query Optimization**:
  - `get_trip_itinerary()` uses `select_related('city')` and `prefetch_related(Prefetch('trip_activities', queryset=TripActivity.objects.select_related('activity').order_by('activity_date', 'start_time', 'activity_order')))` to reconstruct the full page in 1 SQL query.
- **Reordering & Constraint Normalization**:
  - Database check constraint `stop_order >= 0` handled during reorder via atomic temporary offsets (`10000 + idx`).

### Itinerary Data-Flow Architecture

```
User Action (e.g. Add Stop / Schedule Activity / Reorder)
   │
   ▼
React UI Component (AddStopModal / AddActivityModal / StopCard)
   │
   ▼
itineraryService (Axios client with JWT bearer header)
   │
   ▼
Django API View (TripStopCreateView / TripActivityCreateView)
   │
   ▼
itinerary_service (Business Logic & Validation Layer)
   │ ── Date bounds & overlap check
   │ ── City ID match check
   │ ── Order auto-increment & offset normalization
   ▼
PostgreSQL Database (trip_stops & trip_activities with constraints)
   │
   ▼
JSON API Response (TripStopSerializer / TripActivitySerializer)
   │
   ▼
TanStack Query Cache (invalidate ['itinerary', tripId])
   │
   ▼
Updated Itinerary UI (Day-grouped visual render)
```

### Budget Engine (`/api/v1/`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/trips/:id/budget/` | Retrieve complete trip financial calculations, category breakdown, city stop breakdown, daily breakdown, and budget status |
| GET | `/trips/:id/expenses/` | List explicit expense records for trip |
| POST | `/trips/:id/expenses/` | Create explicit expense record |
| DELETE | `/expenses/:id/` | Delete explicit expense record |

### Budget Engine Architecture & Cost Calculation Rules

- **Cost Aggregation Pipeline**:
  - `TripStop.transport_cost` → `TRANSPORT` category
  - `TripStop.accommodation_cost` → `ACCOMMODATION` category
  - `TripActivity.estimated_cost` → mapped by `Activity.category` (`FOOD` → `MEALS`, others → `ACTIVITIES`)
  - `Expense` records → added as explicit additional expenses (`TRANSPORT`, `ACCOMMODATION`, `ACTIVITY`, `MEAL`, `OTHER`). Explicit expenses represent additional out-of-pocket costs beyond itinerary catalog items to prevent silent double-counting.
- **Budget Status Evaluation**:
  - `OVER_BUDGET`: `estimated_total > total_budget` (or `total_budget == 0` when `estimated_total > 0`)
  - `NEAR_LIMIT`: `estimated_total >= total_budget * 0.80`
  - `WITHIN_BUDGET`: Otherwise
- **State Invalidation & Synchronization**:
  - Itinerary mutations (`addStop`, `updateStop`, `deleteStop`, `addActivity`, `updateActivity`, `deleteActivity`) invalidate both `['itinerary', tripId]` and `['trip-budget', tripId]` TanStack Query caches, guaranteeing automatic UI recalculation.

### Budget Engine Data-Flow Diagram

```
Trip (total_budget)
   │
   ├── TripStops (transport_cost + accommodation_cost)
   │      │
   │      └── TripActivities (estimated_cost mapped to ACTIVITIES / MEALS)
   │
   └── Expenses (explicit additional out-of-pocket costs)
          │
          ▼
budget_service.calculate_trip_budget()
   │ ── Sum categories (transport, accommodation, activities, meals, other)
   │ ── Calculate estimated_total & remaining_budget (un-clamped)
   │ ── Evaluate status (WITHIN_BUDGET / NEAR_LIMIT / OVER_BUDGET)
   │ ── Calculate duration_days & average_daily_cost
   │ ── Compute city stop breakdown & day-by-day distribution
   ▼
GET /api/v1/trips/{trip_id}/budget/
   ▼
useTripBudget (TanStack Query cache key ['trip-budget', tripId])
   ▼
BudgetPage Dashboard UI
   │ ── 4 Summary Cards (Total Budget, Estimated Cost, Remaining, Avg/Day)
   │ ── Status Alert Banner
   │ ── Recharts Category Donut Chart & Table
   │ ── Recharts Daily Bar Chart
   └── City Stop Breakdown Cards
```

### Calendar & Timeline Experience (`/trips/:id/calendar`)

- **Single Source of Truth**: Derives presentation directly from existing `GET /api/v1/trips/{trip_id}/itinerary/` and `GET /api/v1/trips/{trip_id}/budget/`. No duplicate database tables or secondary scheduling state.
- **Derived Day Strategy**: Pure utility functions in [`calendarUtils.ts`](file:///d:/Codes/Hackthon/GlobeTrotter/frontend/src/utils/calendarUtils.ts) generate calendar days covering `Trip.start_date` through `Trip.end_date` (including empty "Free Days").
- **Timezone Safety**: `parseLocalDate(dateStr)` parses ISO date-only strings using UTC methods to prevent local timezone offset shifting (e.g. `"2026-08-15"` remains Aug 15 across all browser timezones).
- **Time Ordering & Unscheduled Placement**: Scheduled activities are sorted by `start_time` first (e.g. `"09:00"`, `"14:00"`), followed by `activity_order`. Activities without a `start_time` are displayed under a dedicated "Flexible / Unscheduled" section.

### Calendar & Timeline Flow Diagram

```
Trip
 │
 ├── Trip Date Range (start_date → end_date)
 │      │
 │      ▼
 │   Generated Calendar Days (inclusive of empty Free Days)
 │      │
 ├── TripStops (city, start_date, end_date)
 │      │
 │      ▼
 │   City Transition Headers & Active Destination Mapping
 │      │
 └── TripActivities (activity_date, start_time, estimated_cost)
        │
        ▼
     Grouped by Activity Date
        │
        ▼
     Sorted by Start Time / Activity Order
        │ ── Scheduled items (09:00 AM)
        │ ── Unscheduled items (Flexible / Unscheduled)
        ▼
     Timeline View / 7-Column Calendar Grid UI
```

### Public Sharing & Community Discovery (`/api/v1/`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/trips/:id/publish/` | Publish trip and generate unique share slug |
| POST | `/trips/:id/unpublish/` | Unpublish trip to make it private again |
| GET | `/public/trips/:slug/` | Get read-only public itinerary (no auth required) |
| POST | `/public/trips/:slug/copy/` | Deep-copy public trip into user account as a new private trip |
| GET | `/community/trips/` | List published public trips for community discovery (paginated) |

### Sharing & Copy-Trip Architecture

- **Public Read-Only Security**:
  - `PublicTripDetailResponseSerializer` explicitly serializes only safe public fields (`trip.name`, `description`, `dates`, `duration_days`, `creator.first_name`, `stops`, `budget_summary`).
  - Strictly omits email, password, phone, private profile details, internal auth tokens, or raw private expenses.
  - Private trips (`is_public = False`) return `404 Not Found` to unauthenticated or external requests.
- **Atomic Deep-Copy Pipeline**:
  - `sharing_service.copy_public_trip()` operates inside `transaction.atomic()`.
  - Creates a new `Trip` owned by the requesting user, named `"Copy of {name}"`, initialized as `is_public = False`.
  - Deep-copies all `TripStop` and `TripActivity` items. Reuses master `City` and `Activity` records to prevent catalog duplication.
- **Community Discovery Feed**:
  - `GET /api/v1/community/trips/` returns paginated public trip cards (`is_public = True`) ordered by creation date with search filtering by title, city, or country.

### Public Sharing & Copy-Trip Flow Diagram

```
Original Trip Owner (User A)
   │
   ▼
POST /api/v1/trips/{trip_id}/publish/
   │ ── Generate unique share_slug (slugified-name-hex)
   │ ── Set is_public = True
   ▼
Public Shared URL (/public/trips/{share_slug})
   │
   ├── Logged-Out Visitor
   │      │
   │      ▼
   │   GET /api/v1/public/trips/{slug}/ (Read-Only Itinerary & Budget Summary)
   │
   └── Authenticated Visitor (User B)
          │
          ▼
       POST /api/v1/public/trips/{slug}/copy/
          │ ── transaction.atomic()
          │ ── Create NEW Trip (owner = User B, is_public = False)
          │ ── Deep-copy TripStops & TripActivities
          │ ── Reuse master City & Activity catalog records
          ▼
       Redirect to User B's new private Trip (/trips/{new_id})
### Profile, Settings & Design System Architecture (`/api/v1/auth/me/`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/auth/me/` | Retrieve current authenticated user profile |
| PATCH | `/auth/me/` | Update editable profile fields (`first_name`, `last_name`, `phone`, `city`, `country`, `profile_image`) |

### Design System & Accessibility Lock

- **Color Palette (Light Theme Only)**:
  - Background: Warm off-white (`#fafaf9`)
  - Surface Cards: White (`#ffffff`) with subtle border (`#e7e5e4`)
  - Primary Text: Dark charcoal (`#292524`)
  - Secondary Text: Muted slate (`#78716c`)
  - Accent Color: Teal (`#0d9488` / `primary-600`)
- **Restrained Visual Aesthetics**:
  - No purple/blue gradients, glowing containers, neon accents, or glassmorphism blobs.
  - Clean Inter typography hierarchy with defined page titles, section headers, body text, and meta pills.
- **Accessibility & Focus Rings**:
  - All interactive elements use standard `<button>` or `<a href>` elements.
  - Keyboard navigation supported (Tab, Enter, Escape). Visible focus rings (`focus-visible:ring-2 focus-visible:ring-primary-500`).
  - Mobile responsive navigation drawer supporting viewport sizes from 375px+.
- **Reusable Component System**:
  - `EmptyState`: Standardized empty state card with icon, title, description, and CTA.
  - `Input` / `Select` / `Textarea`: Standardized form controls with associated labels, error states, and helper text.

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
