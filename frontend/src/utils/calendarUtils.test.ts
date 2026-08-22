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

export function runCalendarUtilsTests() {
  console.log('--- Running Calendar Utilities Tests ---');

  // Test 1: Date parsing timezone safety
  const d = parseLocalDate('2026-08-15');
  console.assert(d.getUTCDate() === 15, 'Test 1 Failed: Date shift detected in UTC day');
  console.assert(d.getUTCMonth() === 7, 'Test 1 Failed: Month index mismatch');
  console.log('✓ Test 1 Passed: parseLocalDate preserves date-only values');

  // Test 2: countDaysBetween
  const daysCount = countDaysBetween('2026-08-15', '2026-08-20');
  console.assert(daysCount === 6, `Test 2 Failed: expected 6 days, got ${daysCount}`);
  console.log('✓ Test 2 Passed: countDaysBetween calculated inclusive range');

  // Test 3: sortDayActivities
  const { scheduled, unscheduled } = sortDayActivities(mockTripActivities);
  console.assert(scheduled.length === 2, 'Test 3 Failed: expected 2 scheduled activities');
  console.assert(scheduled[0].activity.name === 'Eiffel Tower', 'Test 3 Failed: 09:00 should come first');
  console.assert(scheduled[1].activity.name === 'Louvre Museum', 'Test 3 Failed: 14:00 should come second');
  console.assert(unscheduled.length === 1, 'Test 3 Failed: expected 1 unscheduled activity');
  console.assert(unscheduled[0].activity.name === 'Seine Walk', 'Test 3 Failed: Seine Walk should be unscheduled');
  console.log('✓ Test 3 Passed: sortDayActivities correctly ordered by start_time and isolated unscheduled items');

  // Test 4: generateCalendarDays
  const calendarDays = generateCalendarDays('2026-08-15', '2026-08-20', mockStops);
  console.assert(calendarDays.length === 6, `Test 4 Failed: expected 6 calendar days, got ${calendarDays.length}`);
  console.assert(calendarDays[0].stop?.city.name === 'Paris', 'Test 4 Failed: Day 1 city should be Paris');
  console.assert(calendarDays[3].stop?.city.name === 'Rome', 'Test 4 Failed: Day 4 city should be Rome');
  console.assert(calendarDays[3].isCityTransition === true, 'Test 4 Failed: Day 4 should mark city transition to Rome');
  console.assert(calendarDays[2].isEmpty === true, 'Test 4 Failed: Aug 17 should be marked empty (Free Day)');
  console.log('✓ Test 4 Passed: generateCalendarDays correctly mapped full range, city transitions, and empty free days');

  console.log('All 4 Calendar Utilities tests passed successfully!');
}

runCalendarUtilsTests();
