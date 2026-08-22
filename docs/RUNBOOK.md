# GlobeTrotter — Operations & Local Setup Runbook

## 1. Prerequisites
- **Python**: 3.11+
- **Node.js**: 20+
- **PostgreSQL**: 15+ (Running locally or via Docker)

---

## 2. Environment Setup

### Backend Environment (`backend/.env`)
```ini
DJANGO_SECRET_KEY=dev-secret-key-change-in-production
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,testserver
DATABASE_NAME=globetrotter
DATABASE_USER=postgres
DATABASE_PASSWORD=1234
DATABASE_HOST=localhost
DATABASE_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## 3. Database Migration & Seed Data
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
.venv\Scripts\activate

# Run database migrations on PostgreSQL
python manage.py migrate

# Seed 12 cities & 60 activities catalog
python manage.py seed_data
```

---

## 4. Running Local Development Servers

### Backend API Server
```bash
cd backend
.venv\Scripts\python manage.py runserver
# Server running at http://127.0.0.1:8000/
```

### Frontend Vite Server
```bash
cd frontend
npm run dev
# App running at http://localhost:5173/
```

---

## 5. Execution Verification & Testing

### Backend Unit Test Suite (91 tests)
```bash
cd backend
.venv\Scripts\python manage.py test tests
```

### Frontend Vitest Unit Tests (4 tests)
```bash
cd frontend
npm run test
```

### Frontend TypeScript Check & Production Build
```bash
cd frontend
npx tsc -b --noEmit
npm run build
```
