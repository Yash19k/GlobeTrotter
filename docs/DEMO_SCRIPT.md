# GlobeTrotter — 3–5 Minute Hackathon Presentation & Live Demo Script

## Overview
This script outlines the exact 3–5 minute live presentation and product demo flow for GlobeTrotter, highlighting the core product journey, technical architecture, and system integration WOW moment.

---

## ⏱ Demo Timeline & Script

### 0:00 – 0:30 | Problem Statement & Solution Overview
* **Presenter**: *"Travel planning today is frustratingly fragmented. Travelers juggle spreadsheets for budgets, maps for destinations, notes for daily schedules, and messaging apps to share plans with friends. GlobeTrotter solves this by bringing multi-city destination discovery, day-wise itinerary building, dynamic budget calculations, visual timeline calendars, and public itinerary sharing into one seamless, connected platform."*
* **Visual**: Show GlobeTrotter Landing / Dashboard screen.

---

### 0:30 – 1:00 | Dashboard & Trip Creation
* **Presenter**: *"Starting on the Dashboard, travelers get an immediate overview of their upcoming journeys, total planned budgets, and quick action controls. Let's click 'Plan New Trip' and create a 10-day European getaway from August 15 to August 25, 2026, with a planned allowance of $3,500."*
* **Action**: Click `Plan New Trip` → Enter Title `"European Summer Escape"` → Set Dates (Aug 15–25, 2026) → Budget `$3,500.00` → Submit.

---

### 1:00 – 2:00 | Multi-City Destinations & Discovery
* **Presenter**: *"Now we build our journey. In the Multi-City Itinerary Builder, we can search our seeded catalog of 12 destination cities. Let's add our first stop in Paris from Aug 15 to Aug 18, and our second stop in Rome from Aug 18 to Aug 22."*
* **Action**: Click `Add Destination Stop` → Select `Paris` (Aug 15–18, Transport $150, Lodging $450) → Submit → Click `Add Destination Stop` → Select `Rome` (Aug 18–22, Transport $200, Lodging $600).

---

### 2:00 – 3:00 | Activity Scheduling & THE WOW MOMENT
* **Presenter**: *"Now let's add activities. Notice the system enforces stop date boundaries—activities can only be scheduled on dates when you are in that city. Let's schedule a visit to the Eiffel Tower in Paris for Aug 16 at 09:00 AM ($35.00), and the Louvre Museum at 02:00 PM ($25.00)."*
* **THE WOW MOMENT**: *"When I hit Save on this new activity, watch how the entire system reacts simultaneously:
  1. The backend persists the `TripActivity` in PostgreSQL.
  2. The itinerary updates with time-sorted activities.
  3. The Budget Engine automatically recalculates the total estimated cost, average daily cost, and updates the remaining allowance banner.
  4. The Calendar Timeline immediately places the activity in its exact date and time slot."*
* **Action**: Add Eiffel Tower (Aug 16, 09:00 AM) → Show toast → Open Budget Tab → Show live recalculation → Open Calendar Tab → Show visual timeline.

---

### 3:00 – 3:30 | Real-Time Financial Budget & Calendar Timeline
* **Presenter**: *"In the Budget module, cost breakdowns are automatically generated from actual relational database records—no hardcoded charts. Recharts renders category donut charts (Lodging, Transport, Activities) and daily cost bar charts. In the Calendar & Timeline view, travelers can switch between a vertical story timeline and a 7-column calendar grid showing city transition banners and free days."*
* **Visual**: Highlight Recharts financial graphs and Calendar Timeline view.

---

### 3:30 – 4:15 | Public Itinerary Sharing
* **Presenter**: *"Once our itinerary is ready, we can share it with the world. Clicking 'Publish Trip' generates a globally unique public URL slug (`share_slug`). Let's copy the share link and open it in an Incognito window."*
* **Action**: Click `Publish Trip` → Click `Copy Share Link` → Open Incognito Window → Paste `/public/trips/:slug`.
* **Presenter**: *"Notice that the public page is completely read-only and unauthenticated. It presents the creator's itinerary and public budget summary while strictly filtering out sensitive user data like emails, passwords, or raw receipts."*

---

### 4:15 – 4:45 | Deep-Copy Trip into Second Account
* **Presenter**: *"Now let's log into a second user account ('Bob') and click 'Copy this Trip'. Through Django's atomic database transaction (`transaction.atomic()`), the entire multi-city itinerary, stops, and activities are deep-copied into Bob's account as a brand new private trip, without duplicating the master City or Activity database catalogs."*
* **Action**: Click `Copy this Trip` as Bob → Show new private trip created in Bob's `My Trips` list.

---

### 4:45 – 5:00 | Architecture & Judging Wrap-Up
* **Presenter**: *"In summary, GlobeTrotter is built with React 19, TypeScript, Django REST Framework, and PostgreSQL. It is 100% verified with 91 backend unit & security tests, Vitest frontend tests, zero TypeScript errors, and production security headers. Thank you!"*
