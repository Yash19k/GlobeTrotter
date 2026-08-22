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
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  cover_image_url?: string;
  is_public: boolean;
  slug?: string;
  status: TripStatus;
  created_at: string;
  updated_at: string;
  owner: Pick<User, 'id' | 'email' | 'first_name' | 'last_name' | 'profile_image'>;
  stops: TripStop[];
}

export type TripStatus = 'planning' | 'ongoing' | 'completed' | 'cancelled';

// ── City / Destination ──────────────────────────────────────

export interface City {
  id: number;
  name: string;
  country: string;
  country_code: string;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
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
  name: string;
  description?: string;
  city: number;
  category: ActivityCategory;
  estimated_cost?: number;
  currency: string;
  duration_minutes?: number;
  image_url?: string;
  rating?: number;
}

export type ActivityCategory =
  | 'sightseeing'
  | 'food'
  | 'adventure'
  | 'culture'
  | 'shopping'
  | 'nightlife'
  | 'nature'
  | 'relaxation'
  | 'transportation'
  | 'other';

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
  trip: Pick<Trip, 'id' | 'title' | 'cover_image_url'>;
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
