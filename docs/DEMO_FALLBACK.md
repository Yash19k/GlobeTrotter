# GlobeTrotter — Hackathon Demo Fallback Plan

## Executive Summary
This document outlines offline, local, and pre-seeded fallback procedures to guarantee an uninterrupted, 100% reliable hackathon presentation regardless of external cloud network latency or platform downtime.

---

## 1. Network & Cloud Outage Fallback Strategy

| Scenario | Risk Level | Primary Action | Fallback Procedure |
|---|---|---|---|
| Cloud Backend Latency / Outage | Medium | Switch to local Django REST server (`http://localhost:8000`) | Run `.venv\Scripts\python manage.py runserver` against local PostgreSQL. Frontend automatically connects. |
| External Image CDN Outage | Low | Fallback image placeholders embedded in UI | Unsplash image URLs fall back gracefully to inline city gradient/icon badges in `CityCard` and `PublicTripPage`. |
| Public Link Network Interruption | Low | Use pre-seeded public trip slug | Pre-publish local trip `european-summer-escape` and access directly at `/public/trips/european-summer-escape`. |

---

## 2. Pre-Seeded Local Demo Accounts & Trips

### Prepared Demo Accounts
- **Account A (Trip Owner)**: `alice@example.com` / `Password123!`
- **Account B (Copy Requester)**: `bob@example.com` / `Password123!`

### Prepared Local Demo Trip Data
- **Title**: `"European Summer Escape"`
- **Dates**: August 15 – August 25, 2026 (10 Days)
- **Planned Budget**: `$3,500.00`
- **Stops**:
  1. **Paris, France**: Aug 15 – Aug 18 (Transport $150, Lodging $450)
     - Eiffel Tower (Aug 16, 09:00 AM, $35.00)
     - Louvre Museum (Aug 16, 02:00 PM, $25.00)
  2. **Rome, Italy**: Aug 18 – Aug 22 (Transport $200, Lodging $600)
     - Colosseum & Forum (Aug 19, 10:00 AM, $30.00)
  3. **Florence, Italy**: Aug 22 – Aug 25 (Transport $100, Lodging $350)
     - Uffizi Gallery (Aug 23, 11:00 AM, $24.00)

---

## 3. Command Line Recovery Script
If a fresh database environment is needed immediately before presentation:

```bash
cd backend
.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py seed_data
```
