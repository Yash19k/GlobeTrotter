# 🌍 GlobeTrotter — Personalized Travel Planning Platform

A personalized multi-city travel planning platform for discovering destinations, building day-wise itineraries, calculating dynamic financial budgets, visualizing interactive timelines, and sharing public travel plans.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, TanStack Query v5, Zustand, React Hook Form, Zod, Recharts, Lucide Icons |
| **Backend** | Python 3.12, Django 5, Django REST Framework, SimpleJWT, WhiteNoise, drf-spectacular |
| **Database** | PostgreSQL (Development & Production) |
| **Testing** | Django APITestCase (91 backend tests), Vitest (4 frontend tests) |

---

## 📁 Repository Structure

```
GlobeTrotter/
├── frontend/                  # React + Vite + TypeScript application
│   ├── src/
│   │   ├── components/        # Reusable UI & Layout components
│   │   ├── pages/             # App pages (Dashboard, Trips, Itinerary, Budget, Calendar, Community, Profile, Settings)
│   │   ├── services/          # Axios API service layer
│   │   ├── stores/            # Zustand state stores
│   │   ├── hooks/             # TanStack Query custom hooks
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Calendar & date utilities
├── backend/                   # Django REST Framework application
│   ├── config/                # Django settings, URLs, WSGI, OpenAPI configuration
│   ├── apps/                  # Core DRF modules (users, trips, destinations, activities, itinerary, budget, community)
│   ├── services/              # Pure Python business logic layer
│   └── tests/                 # 91 unit and integration security tests
└── docs/                      # Comprehensive documentation
    ├── DEVELOPMENT_PLAN.md    # Multi-phase master architecture plan
    ├── SECURITY_AUDIT.md      # Full security & authorization audit report
    ├── PERFORMANCE.md         # Database indexing & N+1 query optimization
    └── RUNBOOK.md             # Development & deployment operations runbook
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: ≥ 20.0.0
- **Python**: ≥ 3.11.0
- **PostgreSQL**: ≥ 15.0

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Test Commands & Quality Audits

### Backend Unit & Security Test Suite (91 tests)
```bash
cd backend
.venv\Scripts\python manage.py test tests
```

### Frontend Vitest Unit Tests (4 tests)
```bash
cd frontend
npm run test
```

### Frontend Type Check & Production Build
```bash
cd frontend
npx tsc -b --noEmit
npm run build
```

---

## 📖 Key API Endpoints

- `GET /health/`: Application health check
- `POST /api/v1/auth/register/`: Register user account
- `POST /api/v1/auth/login/`: JWT authentication
- `GET /api/v1/auth/me/`: Current user profile (GET/PATCH)
- `GET /api/v1/trips/`: Trip CRUD operations
- `GET /api/v1/cities/`: City discovery catalog & search
- `GET /api/v1/activities/`: Activity discovery catalog & filters
- `GET /api/v1/trips/:id/itinerary/`: Multi-city itinerary engine
- `GET /api/v1/trips/:id/budget/`: Real-time budget breakdown
- `POST /api/v1/trips/:id/publish/`: Publish trip & generate share slug
- `GET /api/v1/public/trips/:slug/`: Read-only public itinerary view
- `POST /api/v1/public/trips/:slug/copy/`: Deep-copy public trip to account
- `GET /api/v1/community/trips/`: Community discovery feed
