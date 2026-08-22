import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ListFilter,
  MapPin,
  Clock,
  DollarSign,
  Compass,
  Plus,
  PieChart,
  Map,
} from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { useItinerary } from '@/hooks/useItinerary';
import { useTripBudget } from '@/hooks/useTripBudget';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateCalendarDays } from '@/utils/calendarUtils';

type ViewMode = 'timeline' | 'calendar';

export const CalendarTimelinePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tripId = id ? Number(id) : 0;

  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const {
    data: itinerary,
    isLoading: isItinLoading,
    isError: isItinError,
    error: itinError,
    refetch: refetchItin,
  } = useItinerary(tripId);

  const { data: budget } = useTripBudget(tripId);

  const trip = itinerary?.trip;
  const stops = itinerary?.stops || [];
  const dailyBudgets = budget?.days || [];

  // Generate complete trip calendar days
  const calendarDays = useMemo(() => {
    if (!trip?.start_date || !trip?.end_date) return [];
    return generateCalendarDays(
      trip.start_date,
      trip.end_date,
      stops,
      dailyBudgets
    );
  }, [trip?.start_date, trip?.end_date, stops, dailyBudgets]);

  // Set default selected date for calendar view detail
  const activeSelectedDay = useMemo(() => {
    if (calendarDays.length === 0) return null;
    if (selectedDateStr) {
      return calendarDays.find((d) => d.dateStr === selectedDateStr) || calendarDays[0];
    }
    return calendarDays[0];
  }, [calendarDays, selectedDateStr]);

  if (isItinLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isItinError || !itinerary) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => navigate('/trips')}
            className="inline-flex items-center text-xs font-semibold text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Trips
          </button>
          <div className="space-y-4">
            <Alert
              type="error"
              title="Unable to load itinerary timeline"
              message={(itinError as any)?.message || 'Trip not found or permission denied.'}
            />
            <Button size="sm" variant="outline" onClick={() => refetchItin()}>
              Try Again
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Empty itinerary state
  if (stops.length === 0) {
    return (
      <AppLayout>
        <div className="space-y-8 max-w-3xl mx-auto py-12 text-center">
          <div className="w-16 h-16 rounded-3xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto shadow-xs border border-primary-100">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-neutral-900">Your Journey Hasn't Been Mapped Yet</h2>
            <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              Add your first destination stop in the Itinerary Builder to generate your visual timeline and calendar.
            </p>
          </div>

          <div>
            <Link to={`/trips/${tripId}/itinerary`}>
              <Button size="md" leftIcon={<Plus className="w-4 h-4" />}>
                Build Itinerary Now
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-5">
          <button
            type="button"
            onClick={() => navigate(`/trips/${tripId}`)}
            className="inline-flex items-center text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Trip Overview
          </button>

          <div className="flex items-center space-x-2">
            <Link to={`/trips/${tripId}/itinerary`}>
              <Button size="sm" variant="outline" leftIcon={<Map className="w-4 h-4" />}>
                Itinerary Builder
              </Button>
            </Link>
            <Link to={`/trips/${tripId}/budget`}>
              <Button size="sm" variant="outline" leftIcon={<PieChart className="w-4 h-4" />}>
                Budget Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Trip Summary & View Switcher */}
        <div className="bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Visual Travel Schedule
              </span>
              <span className="text-xs text-neutral-500">• {calendarDays.length} Days</span>
            </div>
            <h1 className="text-2xl font-extrabold text-neutral-900">{trip?.name}</h1>
            <p className="text-xs text-neutral-600 flex items-center space-x-3">
              <span className="inline-flex items-center">
                <CalendarIcon className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                {formatDate(trip?.start_date || '')} – {formatDate(trip?.end_date || '')}
              </span>
              {budget && (
                <span className="inline-flex items-center font-semibold text-neutral-800">
                  <DollarSign className="w-3.5 h-3.5 mr-0.5 text-neutral-500" />
                  Est. {formatCurrency(Number(budget.estimated_total))}
                </span>
              )}
            </p>
          </div>

          {/* View Toggle */}
          <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200/80 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-surface text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 mr-1.5" />
              Timeline View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-surface text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
              Calendar View
            </button>
          </div>
        </div>

        {/* ── TIMELINE VIEW ─────────────────────────────────────── */}
        {viewMode === 'timeline' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {calendarDays.map((day) => {
              return (
                <div key={day.dateStr} className="space-y-4">
                  {/* City Transition Banner */}
                  {day.isCityTransition && day.stop && (
                    <div className="bg-primary-50/70 border border-primary-200/80 rounded-xl p-4 flex items-center justify-between text-primary-900 shadow-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-extrabold">{day.stop.city.name}</h3>
                            <span className="text-[11px] font-semibold bg-white/80 border border-primary-200 px-2 py-0.5 rounded-md">
                              {day.stop.city.country}
                            </span>
                          </div>
                          <p className="text-xs text-primary-800">
                            Stop dates: {formatDate(day.stop.start_date)} – {formatDate(day.stop.end_date)}
                          </p>
                        </div>
                      </div>

                      {Number(day.stop.transport_cost || 0) > 0 && (
                        <span className="text-xs font-semibold text-primary-900 bg-white/80 border border-primary-200 px-3 py-1 rounded-lg">
                          Transport: {formatCurrency(Number(day.stop.transport_cost))}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Day Container Card */}
                  <div className="bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
                    {/* Day Header Bar */}
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-extrabold text-neutral-900 bg-neutral-100 px-3 py-1 rounded-lg">
                          Day {day.dayNumber}
                        </span>
                        <span className="text-sm font-bold text-neutral-800">{day.formattedDate}</span>
                        {day.stop && (
                          <span className="text-xs font-semibold text-neutral-600 bg-neutral-50 border border-neutral-200 px-2.5 py-0.5 rounded-full flex items-center">
                            <MapPin className="w-3 h-3 mr-1 text-neutral-400" />
                            {day.stop.city.name}
                          </span>
                        )}
                      </div>

                      {day.dailyBudget && Number(day.dailyBudget.total_cost || 0) > 0 && (
                        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          Daily Est. {formatCurrency(Number(day.dailyBudget.total_cost))}
                        </span>
                      )}
                    </div>

                    {/* Empty Day View */}
                    {day.isEmpty ? (
                      <div className="py-6 border-2 border-dashed border-neutral-200/70 rounded-xl text-center space-y-2">
                        <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Free Day</p>
                        <p className="text-xs text-neutral-500">No activities scheduled for this date.</p>
                        <div className="pt-1">
                          <Link to={`/trips/${tripId}/itinerary`}>
                            <Button size="sm" variant="outline" className="text-xs">
                              Plan Activity +
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Scheduled Timed Activities */}
                        {day.scheduledActivities.map((act) => (
                          <div
                            key={act.id}
                            className="bg-neutral-50/70 border border-neutral-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-neutral-300 transition-colors"
                          >
                            <div className="flex items-start space-x-3.5">
                              {/* Time Pill */}
                              <div className="bg-surface border border-neutral-200 px-2.5 py-1 rounded-lg text-xs font-bold text-neutral-800 shrink-0 flex items-center shadow-xs">
                                <Clock className="w-3.5 h-3.5 mr-1 text-primary-600" />
                                {act.start_time || 'Timed'}
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-bold text-neutral-900">{act.activity.name}</h4>
                                  <StatusBadge status={act.activity.category} />
                                </div>
                                {act.notes && <p className="text-xs text-neutral-600 leading-relaxed">{act.notes}</p>}
                                <p className="text-[11px] text-neutral-500 flex items-center space-x-2">
                                  <span>{act.activity.duration_minutes} mins</span>
                                </p>
                              </div>
                            </div>

                            {Number(act.estimated_cost || 0) > 0 && (
                              <span className="text-xs font-bold text-neutral-900 self-end sm:self-center shrink-0">
                                {formatCurrency(Number(act.estimated_cost))}
                              </span>
                            )}
                          </div>
                        ))}

                        {/* Unscheduled / Flexible Activities */}
                        {day.unscheduledActivities.length > 0 && (
                          <div className="pt-2 border-t border-neutral-100 space-y-2">
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full inline-block">
                              Flexible / Unscheduled
                            </span>
                            {day.unscheduledActivities.map((act) => (
                              <div
                                key={act.id}
                                className="bg-amber-50/40 border border-amber-200/60 rounded-xl p-3.5 flex items-center justify-between text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-neutral-900">{act.activity.name}</span>
                                    <StatusBadge status={act.activity.category} />
                                  </div>
                                  <p className="text-[11px] text-neutral-500">Duration: {act.activity.duration_minutes} mins</p>
                                </div>
                                <span className="font-bold text-neutral-900">{formatCurrency(Number(act.estimated_cost))}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CALENDAR VIEW ─────────────────────────────────────── */}
        {viewMode === 'calendar' && (
          <div className="space-y-8 max-w-5xl mx-auto">
            {/* 7-Column Grid */}
            <div className="bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-base font-bold text-neutral-900">Trip Calendar Grid</h3>
                <span className="text-xs text-neutral-500">Select a day to inspect schedule</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {calendarDays.map((day) => {
                  const isSelected = activeSelectedDay?.dateStr === day.dateStr;
                  const count = day.scheduledActivities.length + day.unscheduledActivities.length;

                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => setSelectedDateStr(day.dateStr)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[100px] ${
                        isSelected
                          ? 'bg-primary-50/80 border-primary-500 ring-2 ring-primary-500/20'
                          : day.isEmpty
                          ? 'bg-neutral-50/50 border-neutral-200 hover:border-neutral-300'
                          : 'bg-surface border-neutral-200 hover:border-neutral-300 shadow-xs'
                      }`}
                    >
                      {/* Active City Top Indicator Bar */}
                      {day.stop && (
                        <div className="h-1 bg-primary-600 absolute top-0 left-0 right-0" />
                      )}

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-900">Day {day.dayNumber}</span>
                          <span className="text-[10px] text-neutral-500">{day.formattedDate.split(',')[0]}</span>
                        </div>
                        {day.stop && (
                          <p className="text-[11px] font-semibold text-primary-700 truncate mt-1">
                            {day.stop.city.name}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-neutral-100 text-[10px]">
                        {count > 0 ? (
                          <span className="font-bold text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded">
                            {count} act
                          </span>
                        ) : (
                          <span className="text-neutral-400">Free</span>
                        )}

                        {day.dailyBudget && Number(day.dailyBudget.total_cost || 0) > 0 && (
                          <span className="font-semibold text-emerald-700">
                            {formatCurrency(Number(day.dailyBudget.total_cost))}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Detail Drawer / Panel */}
            {activeSelectedDay && (
              <div className="bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-extrabold text-neutral-900 bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1 rounded-lg">
                      Day {activeSelectedDay.dayNumber} Detail
                    </span>
                    <span className="text-sm font-bold text-neutral-800">{activeSelectedDay.formattedDate}</span>
                    {activeSelectedDay.stop && (
                      <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                        {activeSelectedDay.stop.city.name}, {activeSelectedDay.stop.city.country}
                      </span>
                    )}
                  </div>

                  {activeSelectedDay.dailyBudget && (
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      Daily Total: {formatCurrency(Number(activeSelectedDay.dailyBudget.total_cost))}
                    </span>
                  )}
                </div>

                {activeSelectedDay.isEmpty ? (
                  <p className="text-xs text-neutral-500 py-4">No activities scheduled for this date.</p>
                ) : (
                  <div className="space-y-3">
                    {activeSelectedDay.scheduledActivities.map((act) => (
                      <div key={act.id} className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-neutral-900 bg-white border border-neutral-200 px-2 py-0.5 rounded">
                            {act.start_time || 'Timed'}
                          </span>
                          <div>
                            <span className="font-bold text-neutral-900">{act.activity.name}</span>
                            <p className="text-[11px] text-neutral-500">{act.activity.duration_minutes} mins</p>
                          </div>
                        </div>
                        <span className="font-bold text-neutral-900">{formatCurrency(Number(act.estimated_cost))}</span>
                      </div>
                    ))}

                    {activeSelectedDay.unscheduledActivities.map((act) => (
                      <div key={act.id} className="bg-amber-50/50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-neutral-900">{act.activity.name}</span>
                          <p className="text-[11px] text-amber-800 font-medium">Unscheduled / Flexible</p>
                        </div>
                        <span className="font-bold text-neutral-900">{formatCurrency(Number(act.estimated_cost))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
