# GlobeTrotter — Confirmed MVP Scope & Project Limitations

## Executive Summary
This document records the intentional scope boundaries and technical limitations of the GlobeTrotter MVP hackathon build.

---

## 1. Confirmed Scope Boundaries

| Area | Current MVP Implementation | Intentional Limitation / Future Roadmap |
|---|---|---|
| **Currency Support** | USD (`$`) currency standard across calculation engines. | Multi-currency conversion APIs deferred to post-hackathon roadmap. |
| **Travel Catalog** | Seeded catalog of 12 destination cities and 60 activities. | Live flight/hotel booking GDS APIs (Amadeus/Sabre) omitted for hackathon stability. |
| **Public Sharing & Copy** | Read-only public itinerary link + atomic deep-copying into user account. | WebSocket real-time co-editing and live chat omitted to prevent state sync issues. |
| **Media & Assets** | Optimized Unsplash image URL fields with clean UI fallback badges. | S3/Cloudinary direct binary upload infrastructure omitted to preserve hackathon speed. |
| **Social / Community** | Public travel plan discovery feed with search & filter. | Social feeds, likes, comments, and follower notifications intentionally excluded. |
