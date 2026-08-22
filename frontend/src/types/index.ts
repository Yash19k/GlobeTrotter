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
  start_date: string;
  end_date: string;
  stop_order: number;
  transport_cost: number | string;
  accommodation_cost: number | string;
  notes?: string;
  activities?: TripActivity[];
  created_at?: string;
  updated_at?: string;
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
  activity_date: string;
  start_time?: string;
  notes?: string;
  estimated_cost: number | string;
  activity_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface FullItinerary {
  trip: Trip;
  stops: TripStop[];
}

// ── Expense / Budget ────────────────────────────────────────

export type BudgetStatus = 'WITHIN_BUDGET' | 'NEAR_LIMIT' | 'OVER_BUDGET';

export interface BudgetCategoryBreakdown {
  transport: string;
  accommodation: string;
  activities: string;
  meals: string;
  other: string;
}

export interface BudgetStopBreakdown {
  id: number;
  city_id: number;
  city_name: string;
  country: string;
  start_date: string;
  end_date: string;
  transport_cost: string;
  accommodation_cost: string;
  activities_cost: string;
  total_cost: string;
}

export interface BudgetDayBreakdown {
  date: string;
  day_number: number;
  label: string;
  activities_cost: string;
  expenses_cost: string;
  fixed_daily_cost: string;
  total_cost: string;
}

export interface TripBudget {
  trip_id: number;
  trip_name: string;
  currency: string;
  total_budget: string;
  estimated_total: string;
  remaining_budget: string;
  budget_used_percentage: number;
  status: BudgetStatus;
  duration_days: number;
  average_daily_cost: string;
  categories: BudgetCategoryBreakdown;
  stops: BudgetStopBreakdown[];
  days: BudgetDayBreakdown[];
}

export interface Expense {
  id: number;
  trip: number;
  category: string;
  amount: number | string;
  description?: string;
  expense_date: string;
  created_at?: string;
  updated_at?: string;
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

// ── Public Sharing & Community ──────────────────────────────

export interface PublicCreator {
  first_name: string;
}

export interface PublicActivityDetail {
  id: number;
  name: string;
  category: string;
  duration_minutes: number;
  estimated_cost: string;
  image?: string;
}

export interface PublicTripActivity {
  id: number;
  activity: PublicActivityDetail;
  activity_date: string;
  start_time?: string;
  estimated_cost: string;
  notes?: string;
}

export interface PublicCityDetail {
  id: number;
  name: string;
  country: string;
  image?: string;
}

export interface PublicTripStop {
  id: number;
  city: PublicCityDetail;
  start_date: string;
  end_date: string;
  stop_order: number;
  transport_cost: string;
  accommodation_cost: string;
  activities: PublicTripActivity[];
}

export interface PublicBudgetSummary {
  currency: string;
  estimated_total: string;
  average_daily_cost: string;
  categories: Record<string, string>;
}

export interface PublicTripMeta {
  id: number;
  name: string;
  description?: string;
  cover_image?: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  share_slug: string;
  created_at: string;
}

export interface PublicTripDetail {
  trip: PublicTripMeta;
  creator: PublicCreator;
  stops: PublicTripStop[];
  budget_summary: PublicBudgetSummary;
}

export interface CommunityTripCard {
  id: number;
  name: string;
  description?: string;
  cover_image?: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  share_slug: string;
  creator: string;
  cities: { id: number; name: string; country: string }[];
  estimated_cost: string;
  created_at: string;
}

export interface CommunityFeedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CommunityTripCard[];
}

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
