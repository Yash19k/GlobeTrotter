# 🌍 GlobeTrotter

A personalized travel planning platform for creating multi-city trips, building day-wise itineraries, estimating budgets, and sharing travel plans.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Backend | Python, Django, Django REST Framework |
| Database | PostgreSQL (Neon) |
| Auth | SimpleJWT |
| Deployment | Vercel (frontend) · Render (backend) · Neon (database) |

## Project Structure

```
GlobeTrotter/
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level pages
│   │   ├── services/     # API client layer
│   │   ├── stores/       # Zustand state stores
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and constants
│   │   ├── types/        # TypeScript interfaces
│   │   └── routes/       # Route definitions
│   └── ...
├── backend/           # Django + DRF
│   ├── config/        # Django settings, URLs, WSGI
│   ├── apps/          # Django applications
│   │   ├── users/
│   │   ├── trips/
│   │   ├── destinations/
│   │   ├── activities/
│   │   ├── itinerary/
│   │   ├── budget/
│   │   └── community/
│   ├── services/      # Business logic layer
│   ├── utils/         # Shared helpers
│   └── tests/         # Test infrastructure
└── docs/              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- Python ≥ 3.12
- PostgreSQL (or Neon account)

### Setup

1. **Clone and configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and secrets
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend**
   ```bash
   cd backend
   python -m venv .venv
   # Windows: .venv\Scripts\activate
   # macOS/Linux: source .venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

## Development

- Frontend dev server: `http://localhost:5173`
- Backend API: `http://localhost:8000/api/v1/`
- API docs: `http://localhost:8000/api/schema/swagger/`

## License

MIT
