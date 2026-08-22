/**
 * GlobeTrotter — Calendar & Timeline Utilities
 *
 * Pure utility functions to transform itinerary and budget data into
 * structured day-by-day calendar/timeline structures without mutating
 * server state or introducing timezone offset bugs.
 */

import type { TripStop, TripActivity, BudgetDayBreakdown } from '@/types';
import { formatDate } from '@/lib/utils';

export interface CalendarDayItem {
  dateStr: string; // "2026-08-15"
  dayNumber: number; // 1, 2, 3...
  formattedDate: string; // "Aug 15"
  stop: TripStop | null; // Associated city stop for this day
  isCityTransition: boolean; // True if this day starts a new stop
  scheduledActivities: TripActivity[]; // Activities with a start_time, sorted
  unscheduledActivities: TripActivity[]; // Activities without start_time
  dailyBudget: BudgetDayBreakdown | null;
  isEmpty: boolean;
}

/**
 * Safely parses an ISO date string ("2026-08-15") into a Date object
 * using UTC to avoid local timezone offset shifting.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(Date.UTC(year, month, day));
  }
  return new Date(dateStr);
}

/**
 * Calculates days between two date strings (inclusive).
 */
export function countDaysBetween(startStr: string, endStr: string): number {
  const start = parseLocalDate(startStr);
  const end = parseLocalDate(endStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.max(Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1, 1);
}

/**
 * Sorts activities for a single day:
 * Scheduled activities first (by start_time, then activity_order),
 * followed by unscheduled activities.
 */
export function sortDayActivities(activities: TripActivity[]): {
  scheduled: TripActivity[];
  unscheduled: TripActivity[];
} {
  const scheduled: TripActivity[] = [];
  const unscheduled: TripActivity[] = [];

  for (const act of activities) {
    if (act.start_time && act.start_time.trim().length > 0) {
      scheduled.push(act);
    } else {
      unscheduled.push(act);
    }
  }

  scheduled.sort((a, b) => {
    const timeA = a.start_time || '99:99';
    const timeB = b.start_time || '99:99';
    if (timeA !== timeB) return timeA.localeCompare(timeB);
    return (a.activity_order || 0) - (b.activity_order || 0);
  });

  unscheduled.sort((a, b) => (a.activity_order || 0) - (b.activity_order || 0));

  return { scheduled, unscheduled };
}

/**
 * Derives full list of CalendarDayItem objects covering the trip date range.
 */
export function generateCalendarDays(
  startDateStr: string,
  endDateStr: string,
  stops: TripStop[],
  dailyBudgets: BudgetDayBreakdown[] = []
): CalendarDayItem[] {
  if (!startDateStr || !endDateStr) return [];

  const totalDays = countDaysBetween(startDateStr, endDateStr);
  const startDate = parseLocalDate(startDateStr);
  const result: CalendarDayItem[] = [];

  let previousCityId: number | null = null;

  for (let i = 0; i < totalDays; i++) {
    const current = new Date(startDate.getTime());
    current.setUTCDate(startDate.getUTCDate() + i);
    const dateStr = current.toISOString().slice(0, 10);

    // Find stop covering this day
    const stop = stops.find((s) => {
      const sStart = s.start_date.slice(0, 10);
      const sEnd = s.end_date.slice(0, 10);
      return dateStr >= sStart && dateStr <= sEnd;
    }) || null;

    const isCityTransition = stop !== null && stop.city.id !== previousCityId;
    if (stop) {
      previousCityId = stop.city.id;
    }

    // Gather activities scheduled for this date across all stops (or active stop)
    const dayActivities: TripActivity[] = [];
    for (const st of stops) {
      if (st.activities) {
        for (const act of st.activities) {
          if (act.activity_date && act.activity_date.slice(0, 10) === dateStr) {
            dayActivities.push(act);
          }
        }
      }
    }

    const { scheduled, unscheduled } = sortDayActivities(dayActivities);

    // Find daily budget info
    const dailyBudget = dailyBudgets.find((d) => d.date.slice(0, 10) === dateStr) || null;

    const isEmpty = dayActivities.length === 0;

    result.push({
      dateStr,
      dayNumber: i + 1,
      formattedDate: formatDate(dateStr),
      stop,
      isCityTransition,
      scheduledActivities: scheduled,
      unscheduledActivities: unscheduled,
      dailyBudget,
      isEmpty,
    });
  }

  return result;
}
