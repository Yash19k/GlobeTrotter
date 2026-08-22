// GlobeTrotter — Frontend Type Definitions
// This file contains shared TypeScript interfaces used across the application.

// ── User ────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  city?: string;
  country?: string;
  profile_image?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// ── Trip ────────────────────────────────────────────────────

export interface Trip {
  id: number;
  name: string;
  description?: string;
  cover_image?: string;
  start_date: string;
  end_date: string;
  total_budget: number | string;
  is_public: boolean;
  share_slug?: string;
  status: TripStatus;
  destination_count: number;
  user_email?: string;
  created_at: string;
  updated_at: string;
}

export type TripStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

// ── City / Destination ──────────────────────────────────────

export interface City {
  id: number;
  name: string;
  country: string;
  region?: string;
  description?: string;
  image?: string;
  cost_index: number;
  popularity_score: number | string;
  activity_count?: number;
  created_at?: string;
  updated_at?: string;
}

// ── Trip Stop ───────────────────────────────────────────────

export interface TripStop {
  id: number;
  trip: number;
  city: City;
  arrival_date: string;
  departure_date: string;
  order: number;
  notes?: string;
}

// ── Activity ────────────────────────────────────────────────

export interface Activity {
  id: number;
  city: number;
  city_name?: string;
  city_country?: string;
  name: string;
  description?: string;
  category: ActivityCategory | string;
  duration_minutes: number;
  estimated_cost: number | string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export type ActivityCategory =
  | 'SIGHTSEEING'
  | 'FOOD'
  | 'ADVENTURE'
  | 'CULTURE'
  | 'SHOPPING'
  | 'NIGHTLIFE'
  | 'NATURE'
  | 'OTHER';

// ── Trip Activity (itinerary item) ──────────────────────────

export interface TripActivity {
  id: number;
  trip_stop: number;
  activity: Activity;
  date: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  order: number;
  custom_cost?: number;
}

// ── Expense / Budget ────────────────────────────────────────

export interface Expense {
  id: number;
  trip: number;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  date: string;
}

export type ExpenseCategory =
  | 'accommodation'
  | 'transportation'
  | 'food'
  | 'activities'
  | 'shopping'
  | 'insurance'
  | 'visa'
  | 'other';

// ── Shared Trip ─────────────────────────────────────────────

export interface SharedTrip {
  id: number;
  trip: number;
  shared_by: Pick<User, 'id' | 'email' | 'first_name' | 'last_name'>;
  slug: string;
  is_public: boolean;
  created_at: string;
}

// ── Community ───────────────────────────────────────────────

export interface CommunityPost {
  id: number;
  author: Pick<User, 'id' | 'email' | 'first_name' | 'last_name' | 'profile_image'>;
  trip: Pick<Trip, 'id' | 'name' | 'cover_image'>;
  caption?: string;
  likes_count: number;
  created_at: string;
}

// ── API Response Wrappers ───────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  [field: string]: unknown;
}
