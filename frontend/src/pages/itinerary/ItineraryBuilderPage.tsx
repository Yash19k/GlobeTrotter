import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Compass,
  Calendar,
  MapPin,
  Sparkles,
} from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { StopCard } from '@/components/itinerary/StopCard';
import { ActivityItem } from '@/components/itinerary/ActivityItem';
import { AddStopModal } from '@/components/itinerary/AddStopModal';
import { AddActivityModal } from '@/components/itinerary/AddActivityModal';

import {
  useItinerary,
  useAddStop,
  useDeleteStop,
  useReorderStops,
  useAddActivity,
  useDeleteActivity,
  useReorderActivities,
} from '@/hooks/useItinerary';
import { formatDate, formatCurrency, daysBetween } from '@/lib/utils';
import type { TripStop, TripActivity } from '@/types';

export const ItineraryBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tripId = id ? Number(id) : 0;

  // Itinerary Query
  const { data: itineraryData, isLoading, isError, error } = useItinerary(tripId);

  // Mutations
  const addStopMutation = useAddStop(tripId);
  const deleteStopMutation = useDeleteStop(tripId);
  const reorderStopsMutation = useReorderStops(tripId);

  const addActivityMutation = useAddActivity(tripId);
  const deleteActivityMutation = useDeleteActivity(tripId);
  const reorderActivitiesMutation = useReorderActivities(tripId);

  // UI Selection State
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null);
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [stopToDelete, setStopToDelete] = useState<TripStop | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<TripActivity | null>(null);

  const trip = itineraryData?.trip;
  const stops = itineraryData?.stops || [];

  // Default selected stop to first stop if none selected
  const activeStop = useMemo(() => {
    if (stops.length === 0) return null;
    if (selectedStopId) {
      const found = stops.find((s) => s.id === selectedStopId);
      if (found) return found;
    }
    return stops[0];
  }, [stops, selectedStopId]);

  // Derived Days for the active stop
  const stopDays = useMemo(() => {
    if (!activeStop) return [];
    const start = new Date(activeStop.start_date);
    const days: { dateStr: string; label: string; activities: TripActivity[] }[] = [];

    const totalDays = daysBetween(activeStop.start_date, activeStop.end_date) + 1;

    for (let i = 0; i < totalDays; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const dateStr = current.toISOString().slice(0, 10);
      const label = `Day ${i + 1} • ${formatDate(dateStr)}`;

      const dayActivities = (activeStop.activities || [])
        .filter((act) => act.activity_date === dateStr)
        .sort((a, b) => {
          if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time);
          if (a.start_time) return -1;
          if (b.start_time) return 1;
          return (a.activity_order || 0) - (b.activity_order || 0);
        });

      days.push({ dateStr, label, activities: dayActivities });
    }

    return days;
  }, [activeStop]);

  // Stop Reordering Handlers
  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    if (stops.length <= 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stops.length) return;

    const newOrder = [...stops];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIdx, 0, moved);

    const stopIds = newOrder.map((s) => s.id);
    reorderStopsMutation.mutate(stopIds);
  };

  // Activity Reordering Handlers
  const handleMoveActivity = (dayActivities: TripActivity[], index: number, direction: 'up' | 'down') => {
    if (!activeStop || dayActivities.length <= 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= dayActivities.length) return;

    const newDayOrder = [...dayActivities];
    const [moved] = newDayOrder.splice(index, 1);
    newDayOrder.splice(targetIdx, 0, moved);

    // Combine all activities for this stop preserving updated day order
    const allStopActs = (activeStop.activities || []).filter(
      (a) => a.activity_date !== dayActivities[0].activity_date
    );
    const combined = [...allStopActs, ...newDayOrder].map((a) => a.id);

    reorderActivitiesMutation.mutate({ stopId: activeStop.id, activityIds: combined });
  };

  // Delete Confirmations
  const handleConfirmDeleteStop = () => {
    if (stopToDelete) {
      deleteStopMutation.mutate(stopToDelete.id, {
        onSuccess: () => setStopToDelete(null),
      });
    }
  };

  const handleConfirmDeleteActivity = () => {
    if (activityToDelete) {
      deleteActivityMutation.mutate(activityToDelete.id, {
        onSuccess: () => setActivityToDelete(null),
      });
    }
  };

  // Total Itinerary Cost Calculation
  const totalTripCost = stops.reduce((acc, stop) => {
    const transport = Number(stop.transport_cost || 0);
    const lodging = Number(stop.accommodation_cost || 0);
    const acts = (stop.activities || []).reduce((a, act) => a + Number(act.estimated_cost || 0), 0);
    return acc + transport + lodging + acts;
  }, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 pb-5">
          <button
            type="button"
            onClick={() => navigate(`/trips/${tripId}`)}
            className="inline-flex items-center text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Trip Overview
          </button>

          {trip && (
            <div className="flex items-center space-x-3">
              <StatusBadge status={trip.status} />
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddStopOpen(true)}>
                Add City Stop
              </Button>
            </div>
          )}
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="bg-surface rounded-2xl border border-neutral-200 p-8 space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : isError || !trip ? (
          <Alert
            type="error"
            title="Unable to load itinerary"
            message={(error as any)?.message || 'Trip not found or permission denied.'}
          />
        ) : (
          <div className="space-y-6">
            {/* Trip Hero Metadata */}
            <div className="bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Multi-City Itinerary Builder</span>
                </div>
                <h1 className="text-2xl font-extrabold text-neutral-900">{trip.name}</h1>
                <p className="text-xs text-neutral-500 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                  {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
                </p>
              </div>

              <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-neutral-200 pt-4 md:pt-0 md:pl-6 text-xs">
                <div>
                  <span className="text-neutral-500 font-medium block">Planned Budget</span>
                  <span className="text-sm font-bold text-neutral-900">{formatCurrency(Number(trip.total_budget))}</span>
                </div>

                <div>
                  <span className="text-neutral-500 font-medium block">Scheduled Cost</span>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(totalTripCost)}</span>
                </div>

                <div>
                  <span className="text-neutral-500 font-medium block">City Stops</span>
                  <span className="text-sm font-bold text-neutral-900">{stops.length} cities</span>
                </div>
              </div>
            </div>

            {/* Main Builder Grid */}
            {stops.length === 0 ? (
              /* Empty Stops State */
              <div className="bg-surface rounded-2xl border border-dashed border-neutral-300 p-12 text-center max-w-lg mx-auto my-8">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Start building your journey</h3>
                <p className="text-sm text-neutral-600 mt-1 mb-6 leading-relaxed">
                  No city stops added to this trip yet. Add your first destination to start scheduling daily activities.
                </p>
                <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddStopOpen(true)}>
                  Add Your First City Stop
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: City Stops List (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-neutral-900 flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-primary-600" />
                      <span>Trip Destinations ({stops.length})</span>
                    </h2>
                    <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsAddStopOpen(true)}>
                      Add Stop
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {stops.map((stop, idx) => (
                      <StopCard
                        key={stop.id}
                        stop={stop}
                        isSelected={activeStop?.id === stop.id}
                        isFirst={idx === 0}
                        isLast={idx === stops.length - 1}
                        onSelect={() => setSelectedStopId(stop.id)}
                        onMoveUp={() => handleMoveStop(idx, 'up')}
                        onMoveDown={() => handleMoveStop(idx, 'down')}
                        onDelete={() => setStopToDelete(stop)}
                      />
                    ))}
                  </div>
                </div>

                {/* Right Column: Selected Stop Day-Wise Activities (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  {activeStop && (
                    <div className="bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
                      {/* Active Stop Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={activeStop.city.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=200&q=80'}
                            alt={activeStop.city.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div>
                            <h3 className="text-xl font-bold text-neutral-900">{activeStop.city.name}, {activeStop.city.country}</h3>
                            <p className="text-xs text-neutral-500 flex items-center mt-0.5">
                              <Calendar className="w-3.5 h-3.5 mr-1 text-primary-600" />
                              {formatDate(activeStop.start_date)} – {formatDate(activeStop.end_date)}
                            </p>
                          </div>
                        </div>

                        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddActivityOpen(true)}>
                          Add Activity
                        </Button>
                      </div>

                      {/* Day Groupings */}
                      <div className="space-y-6">
                        {stopDays.map((day) => (
                          <div key={day.dateStr} className="space-y-3">
                            <div className="flex items-center space-x-2 text-xs font-bold text-neutral-800 bg-neutral-100/70 border border-neutral-200/80 px-3.5 py-1.5 rounded-xl">
                              <Calendar className="w-3.5 h-3.5 text-primary-600" />
                              <span>{day.label}</span>
                              <span className="text-neutral-400 font-normal text-[11px] ml-auto">
                                {day.activities.length} planned
                              </span>
                            </div>

                            {day.activities.length === 0 ? (
                              <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-xl p-4 text-center">
                                <p className="text-xs text-neutral-500">No activities scheduled for this day.</p>
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                {day.activities.map((act, actIdx) => (
                                  <ActivityItem
                                    key={act.id}
                                    item={act}
                                    isFirst={actIdx === 0}
                                    isLast={actIdx === day.activities.length - 1}
                                    onMoveUp={() => handleMoveActivity(day.activities, actIdx, 'up')}
                                    onMoveDown={() => handleMoveActivity(day.activities, actIdx, 'down')}
                                    onDelete={() => setActivityToDelete(act)}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {trip && (
        <AddStopModal
          isOpen={isAddStopOpen}
          trip={trip}
          isSubmitting={addStopMutation.isPending}
          onClose={() => setIsAddStopOpen(false)}
          onSubmit={async (payload) => {
            await addStopMutation.mutateAsync(payload);
          }}
        />
      )}

      {activeStop && (
        <AddActivityModal
          isOpen={isAddActivityOpen}
          stop={activeStop}
          isSubmitting={addActivityMutation.isPending}
          onClose={() => setIsAddActivityOpen(false)}
          onSubmit={async (payload) => {
            await addActivityMutation.mutateAsync({ stopId: activeStop.id, payload });
          }}
        />
      )}

      {/* Stop Delete Dialog */}
      <ConfirmDialog
        isOpen={!!stopToDelete}
        title="Delete City Stop"
        message={`Are you sure you want to remove ${stopToDelete?.city.name} from this trip? All scheduled activities in this stop will also be removed.`}
        confirmText="Remove Stop"
        isLoading={deleteStopMutation.isPending}
        onClose={() => setStopToDelete(null)}
        onConfirm={handleConfirmDeleteStop}
      />

      {/* Activity Delete Dialog */}
      <ConfirmDialog
        isOpen={!!activityToDelete}
        title="Remove Activity"
        message={`Are you sure you want to remove "${activityToDelete?.activity.name}" from your itinerary?`}
        confirmText="Remove Activity"
        isLoading={deleteActivityMutation.isPending}
        onClose={() => setActivityToDelete(null)}
        onConfirm={handleConfirmDeleteActivity}
      />
    </AppLayout>
  );
};
