import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Map } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { TripCard } from '@/components/trip/TripCard';
import { TripCardSkeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTrips, useDeleteTrip } from '@/hooks/useTrips';
import type { Trip } from '@/types';

export const MyTripsPage: React.FC = () => {
  const { data: trips, isLoading, isError, error } = useTrips();
  const deleteTripMutation = useDeleteTrip();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);

  const filteredTrips = useMemo(() => {
    if (!trips) return [];
    return trips.filter((trip) => {
      const matchesSearch =
        trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trip.description && trip.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter =
        activeFilter === 'ALL' || trip.status.toUpperCase() === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [trips, searchQuery, activeFilter]);

  const handleDeleteConfirm = () => {
    if (tripToDelete) {
      deleteTripMutation.mutate(tripToDelete.id, {
        onSuccess: () => setTripToDelete(null),
      });
    }
  };

  const filterTabs: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Trips' },
    { id: 'UPCOMING', label: 'Upcoming' },
    { id: 'ONGOING', label: 'Ongoing' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              My Trips
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Manage and organize all your upcoming and past travel itineraries.
            </p>
          </div>

          <Link to="/trips/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>Plan New Trip</Button>
          </Link>
        </div>

        {/* Error Alert */}
        {isError && (
          <Alert
            type="error"
            title="Unable to fetch trips"
            message={(error as any)?.message || 'Check your connection and try again.'}
          />
        )}

        {/* View Layout Switcher & Sort Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-neutral-200 shadow-xs">
          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Trip Grid or States */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TripCardSkeleton />
            <TripCardSkeleton />
            <TripCardSkeleton />
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-dashed border-neutral-300 p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto mb-4">
              <Map className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">No trips found</h3>
            <p className="text-sm text-neutral-600 mt-1 mb-6 leading-relaxed">
              {searchQuery || activeFilter !== 'ALL'
                ? 'Try adjusting your search query or filter settings.'
                : 'You have no recorded trips yet. Create your first trip to get started.'}
            </p>
            {searchQuery || activeFilter !== 'ALL' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('ALL');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Link to="/trips/new">
                <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Plan New Trip
                </Button>
              </Link>
            )}
          </div>
        ) : activeFilter === 'ALL' && !searchQuery ? (
          /* Grouped Sections as shown in Wireframe Screen 6 */
          <div className="space-y-8">
            {/* Ongoing Section */}
            {filteredTrips.some((t) => t.status === 'ONGOING') && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-teal-200 pb-2">
                  <span className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
                  <h2 className="text-base font-bold text-neutral-900">Ongoing Adventures</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTrips
                    .filter((t) => t.status === 'ONGOING')
                    .map((trip) => (
                      <TripCard key={trip.id} trip={trip} onDelete={(t) => setTripToDelete(t)} />
                    ))}
                </div>
              </div>
            )}

            {/* Upcoming Section */}
            {filteredTrips.some((t) => t.status === 'UPCOMING') && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-primary-200 pb-2">
                  <span className="w-3 h-3 rounded-full bg-primary-500" />
                  <h2 className="text-base font-bold text-neutral-900">Upcoming Journeys</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTrips
                    .filter((t) => t.status === 'UPCOMING')
                    .map((trip) => (
                      <TripCard key={trip.id} trip={trip} onDelete={(t) => setTripToDelete(t)} />
                    ))}
                </div>
              </div>
            )}

            {/* Completed Section */}
            {filteredTrips.some((t) => t.status === 'COMPLETED') && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-neutral-200 pb-2">
                  <span className="w-3 h-3 rounded-full bg-neutral-400" />
                  <h2 className="text-base font-bold text-neutral-900">Completed Travels</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTrips
                    .filter((t) => t.status === 'COMPLETED')
                    .map((trip) => (
                      <TripCard key={trip.id} trip={trip} onDelete={(t) => setTripToDelete(t)} />
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDelete={(t) => setTripToDelete(t)} />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!tripToDelete}
        title="Delete Trip"
        message={`Are you sure you want to delete "${tripToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Trip"
        isLoading={deleteTripMutation.isPending}
        onClose={() => setTripToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </AppLayout>
  );
};
