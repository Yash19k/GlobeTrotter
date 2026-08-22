import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Compass, Calendar, MapPin, DollarSign, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { TripCard } from '@/components/trip/TripCard';
import { TripCardSkeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { useAuthStore } from '@/stores/authStore';
import { useTrips, useDeleteTrip } from '@/hooks/useTrips';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Trip } from '@/types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: trips, isLoading, isError, error } = useTrips();
  const deleteTripMutation = useDeleteTrip();

  const [tripToDelete, setTripToDelete] = React.useState<Trip | null>(null);

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const upcomingTrips = (trips || []).filter((t) => t.status === 'UPCOMING' || t.status === 'ONGOING');
  const nextTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;
  const totalBudget = (trips || []).reduce((acc, t) => acc + Number(t.total_budget || 0), 0);

  const handleDeleteConfirm = () => {
    if (tripToDelete) {
      deleteTripMutation.mutate(tripToDelete.id, {
        onSuccess: () => setTripToDelete(null),
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {getGreeting()}, {user?.first_name || 'Traveler'} 👋
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Plan your next adventure, organize itineraries, and manage budgets.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/trips/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>Plan New Trip</Button>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {isError && (
          <Alert
            type="error"
            title="Failed to load dashboard data"
            message={(error as any)?.message || 'Unable to connect to server. Please try again.'}
          />
        )}

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface rounded-2xl border border-neutral-200 p-5 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Trips</p>
              <p className="text-2xl font-bold text-neutral-900">{isLoading ? '...' : trips?.length || 0}</p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-neutral-200 p-5 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Active & Upcoming</p>
              <p className="text-2xl font-bold text-neutral-900">{isLoading ? '...' : upcomingTrips.length}</p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-neutral-200 p-5 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Planned Budget</p>
              <p className="text-2xl font-bold text-neutral-900">
                {isLoading ? '...' : formatCurrency(totalBudget)}
              </p>
            </div>
          </div>
        </div>

        {/* Next Upcoming Trip Hero Banner */}
        {nextTrip && (
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 hidden md:block">
              <img
                src={nextTrip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center space-x-2 bg-primary-500/20 border border-primary-400/30 px-3 py-1 rounded-full text-xs font-semibold text-primary-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next Upcoming Adventure</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">{nextTrip.name}</h2>
              {nextTrip.description && <p className="text-sm text-neutral-300 line-clamp-2">{nextTrip.description}</p>}
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300 pt-2">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5 text-primary-400" />
                  {formatDate(nextTrip.start_date)} – {formatDate(nextTrip.end_date)}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5 text-primary-400" />
                  {nextTrip.destination_count || 0} destinations planned
                </span>
                <span className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1.5 text-emerald-400" />
                  {formatCurrency(Number(nextTrip.total_budget))}
                </span>
              </div>
              <div className="pt-2">
                <Link to={`/trips/${nextTrip.id}`}>
                  <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Open Itinerary
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Trips Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">Your Trips</h2>
            {(trips || []).length > 0 && (
              <Link to="/trips" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                View all trips →
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
            </div>
          ) : (trips || []).length === 0 ? (
            /* Empty State */
            <div className="bg-surface rounded-2xl border border-dashed border-neutral-300 p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Your next adventure starts here</h3>
              <p className="text-sm text-neutral-600 mt-1.5 mb-6 leading-relaxed">
                You haven't created any travel plans yet. Start by defining your destination dates and budget.
              </p>
              <Link to="/trips/new">
                <Button leftIcon={<Plus className="w-4 h-4" />}>Plan Your First Trip</Button>
              </Link>
            </div>
          ) : (
            /* Trip Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips!.slice(0, 6).map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={(t) => setTripToDelete(t)} />
              ))}
            </div>
          )}
        </div>
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
