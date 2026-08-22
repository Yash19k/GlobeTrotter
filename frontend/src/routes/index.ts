// GlobeTrotter — Route Definitions
// All application routes defined in one place for consistency.

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Main
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',

  // Trips
  TRIPS: '/trips',
  TRIP_NEW: '/trips/new',
  TRIP_DETAIL: '/trips/:id',
  TRIP_EDIT: '/trips/:id/edit',
  TRIP_CALENDAR: '/trips/:id/calendar',
  TRIP_BUDGET: '/trips/:id/budget',

  // Discovery
  DISCOVER: '/discover',

  // Community
  COMMUNITY: '/community',

  // Public
  PUBLIC_TRIP: '/public/trips/:slug',

  // Admin (optional)
  ADMIN: '/admin',
} as const;

// Helper to generate dynamic routes
export function tripRoute(id: number | string): string {
  return `/trips/${id}`;
}

export function tripEditRoute(id: number | string): string {
  return `/trips/${id}/edit`;
}

export function tripCalendarRoute(id: number | string): string {
  return `/trips/${id}/calendar`;
}

export function tripBudgetRoute(id: number | string): string {
  return `/trips/${id}/budget`;
}

export function publicTripRoute(slug: string): string {
  return `/public/trips/${slug}`;
}
