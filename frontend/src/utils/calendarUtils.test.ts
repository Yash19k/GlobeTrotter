import { describe, it, expect } from 'vitest';
import {
  parseLocalDate,
  countDaysBetween,
  sortDayActivities,
  generateCalendarDays,
} from './calendarUtils';
import type { TripStop, TripActivity, Activity } from '@/types';

// Mock Data
const mockCityParis = { id: 1, name: 'Paris', country: 'France', cost_index: 4, popularity_score: 95 };
const mockCityRome = { id: 2, name: 'Rome', country: 'Italy', cost_index: 3, popularity_score: 90 };

const mockActivityEiffel: Activity = {
  id: 101,
  city: 1,
  name: 'Eiffel Tower',
  category: 'SIGHTSEEING',
  duration_minutes: 120,
  estimated_cost: '35.00',
};

const mockActivityLouvre: Activity = {
  id: 102,
  city: 1,
  name: 'Louvre Museum',
  category: 'CULTURE',
  duration_minutes: 180,
  estimated_cost: '25.00',
};

const mockActivityColosseum: Activity = {
  id: 103,
  city: 2,
  name: 'Colosseum',
  category: 'SIGHTSEEING',
  duration_minutes: 150,
  estimated_cost: '30.00',
};

const mockTripActivities: TripActivity[] = [
  {
    id: 1,
    trip_stop: 10,
    activity: mockActivityLouvre,
    activity_date: '2026-08-15',
    start_time: '14:00',
    estimated_cost: '25.00',
    activity_order: 2,
  },
  {
    id: 2,
    trip_stop: 10,
    activity: mockActivityEiffel,
    activity_date: '2026-08-15',
    start_time: '09:00',
    estimated_cost: '35.00',
    activity_order: 1,
  },
  {
    id: 3,
    trip_stop: 10,
    activity: { ...mockActivityEiffel, name: 'Seine Walk' },
    activity_date: '2026-08-15',
    start_time: '', // Unscheduled
    estimated_cost: '0.00',
    activity_order: 3,
  },
];

const mockStops: TripStop[] = [
  {
    id: 10,
    trip: 1,
    city: mockCityParis,
    start_date: '2026-08-15',
    end_date: '2026-08-17',
    stop_order: 1,
    transport_cost: '100.00',
    accommodation_cost: '300.00',
    activities: mockTripActivities,
  },
  {
    id: 20,
    trip: 1,
    city: mockCityRome,
    start_date: '2026-08-18',
    end_date: '2026-08-20',
    stop_order: 2,
    transport_cost: '150.00',
    accommodation_cost: '400.00',
    activities: [
      {
        id: 4,
        trip_stop: 20,
        activity: mockActivityColosseum,
        activity_date: '2026-08-18',
        start_time: '10:00',
        estimated_cost: '30.00',
        activity_order: 1,
      },
    ],
  },
];

describe('Calendar Utilities Unit Tests', () => {
  it('parseLocalDate preserves date-only values without timezone shift', () => {
    const d = parseLocalDate('2026-08-15');
    expect(d.getUTCDate()).toBe(15);
    expect(d.getUTCMonth()).toBe(7);
  });

  it('countDaysBetween calculates correct inclusive date count', () => {
    const daysCount = countDaysBetween('2026-08-15', '2026-08-20');
    expect(daysCount).toBe(6);
  });

  it('sortDayActivities orders scheduled items by time and isolates unscheduled items', () => {
    const { scheduled, unscheduled } = sortDayActivities(mockTripActivities);
    expect(scheduled.length).toBe(2);
    expect(scheduled[0].activity.name).toBe('Eiffel Tower'); // 09:00 AM
    expect(scheduled[1].activity.name).toBe('Louvre Museum'); // 14:00 PM
    expect(unscheduled.length).toBe(1);
    expect(unscheduled[0].activity.name).toBe('Seine Walk');
  });

  it('generateCalendarDays maps full range, city transitions, and empty free days', () => {
    const calendarDays = generateCalendarDays('2026-08-15', '2026-08-20', mockStops);
    expect(calendarDays.length).toBe(6);
    expect(calendarDays[0].stop?.city.name).toBe('Paris');
    expect(calendarDays[3].stop?.city.name).toBe('Rome');
    expect(calendarDays[3].isCityTransition).toBe(true);
    expect(calendarDays[2].isEmpty).toBe(true);
  });
});
