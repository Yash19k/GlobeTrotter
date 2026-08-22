# GlobeTrotter — Performance & Query Optimization Report

## Executive Summary
This document outlines database index coverage, N+1 query prevention, pagination rules, frontend debounce strategies, and build bundle analysis for GlobeTrotter.

---

## 1. Database Indexes & Query Scoping
The PostgreSQL relational database includes optimized indexes for critical lookup paths:
- `users`: `email` (unique index)
- `trips`: `user_id`, `share_slug` (unique index), `is_public`, `created_at`
- `trip_stops`: `trip_id`, `city_id`, `stop_order`, `(trip_id, stop_order)`
- `trip_activities`: `trip_stop_id`, `activity_id`, `activity_date`, `activity_order`
- `expenses`: `trip_id`, `category`, `expense_date`
- `cities`: `name`, `country`, `popularity_score`
- `activities`: `city_id`, `category`, `popularity_score`

---

## 2. N+1 Query Prevention & Prefetching
- **Itinerary & Budget Service**: Uses `prefetch_related("stops__city", "stops__trip_activities__activity")` and `select_related("user")` to execute multi-city itinerary calculations in O(1) query rounds.
- **Community Feed**: Uses `prefetch_related("stops__city", "stops__trip_activities")` and `select_related("user")` for `GET /api/v1/community/trips/`.
- **Public Itinerary Endpoint**: Uses `prefetch_related` to serve full public trip details cleanly.

---

## 3. Frontend Debouncing & Pagination
- **Search Debounce**: City and activity search inputs use `useDebounce(search, 300)` to prevent request storms during typing.
- **API Pagination**: Community discovery feed and city catalog endpoints implement DRF `PageNumberPagination` (12 items per page) to prevent large payload overhydration.

---

## 4. Frontend Bundle Audit
- `npm run build` output:
  - HTML size: `0.89 kB`
  - CSS size: `52.89 kB`
  - JS bundle size: `956.24 kB` (gzip: `267.95 kB`)
