import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign, MapPin, Edit3, Trash2, Sparkles, Map, PieChart, CalendarDays, Share2, Check, Globe, Lock } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTrip, useDeleteTrip } from '@/hooks/useTrips';
import { usePublishTrip, useUnpublishTrip } from '@/hooks/usePublicSharing';
import { formatDate, formatCurrency, daysBetween } from '@/lib/utils';

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: trip, isLoading, isError, error } = useTrip(id);
  const deleteTripMutation = useDeleteTrip();
  const publishMutation = usePublishTrip(id || 0);
  const unpublishMutation = useUnpublishTrip(id || 0);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDeleteConfirm = () => {
    if (id) {
      deleteTripMutation.mutate(id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          navigate('/trips');
        },
      });
    }
  };

  const durationDays = trip ? daysBetween(trip.start_date, trip.end_date) + 1 : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/trips')}
            className="inline-flex items-center text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to My Trips
          </button>

          {trip && (
            <div className="flex items-center space-x-2">
              <Link to={`/trips/${trip.id}/itinerary`}>
                <Button size="sm" leftIcon={<Map className="w-4 h-4" />}>
                  Itinerary Builder
                </Button>
              </Link>
              <Link to={`/trips/${trip.id}/calendar`}>
                <Button variant="outline" size="sm" leftIcon={<CalendarDays className="w-4 h-4" />}>
                  Calendar
                </Button>
              </Link>
              <Link to={`/trips/${trip.id}/edit`}>
                <Button variant="outline" size="sm" leftIcon={<Edit3 className="w-4 h-4" />}>
                  Edit Trip
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => setIsDeleteOpen(true)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="bg-surface rounded-2xl border border-neutral-200 p-8 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : isError || !trip ? (
          <Alert
            type="error"
            title="Trip Not Found"
            message={(error as any)?.message || 'The requested trip does not exist or you do not have permission to view it.'}
          />
        ) : (
          <div className="space-y-8">
            {/* Hero Cover Card */}
            <div className="relative bg-surface rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="relative h-64 sm:h-80 w-full bg-neutral-900">
                <img
                  src={
                    trip.cover_image ||
                    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt={trip.name}
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                <div className="absolute top-4 right-4">
                  <StatusBadge status={trip.status} className="shadow-md text-sm px-3 py-1" />
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm">
                    {trip.name}
                  </h1>
                  {trip.description && (
                    <p className="text-sm sm:text-base text-neutral-200 max-w-3xl leading-relaxed">
                      {trip.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center space-x-4">
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Travel Dates</p>
                  <p className="text-sm font-bold text-neutral-900">
                    {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
                  </p>
                  <p className="text-xs text-neutral-500">{durationDays} day{durationDays !== 1 ? 's' : ''} duration</p>
                </div>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center space-x-4">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Budget</p>
                  <p className="text-sm font-bold text-neutral-900">
                    {formatCurrency(Number(trip.total_budget))}
                  </p>
                  <p className="text-xs text-neutral-500">Planned allowance</p>
                </div>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center space-x-4">
                <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Destinations</p>
                  <p className="text-sm font-bold text-neutral-900">
                    {trip.destination_count || 0} cities planned
                  </p>
                  <p className="text-xs text-neutral-500">Multi-city stops</p>
                </div>
              </div>
            </div>

            {/* Publicity & Public Sharing Panel */}
            <div className="bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    trip.is_public ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {trip.is_public ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-neutral-900">Publicity & Sharing</h3>
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        trip.is_public ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}>
                        {trip.is_public ? 'PUBLIC' : 'PRIVATE'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {trip.is_public
                        ? 'Anyone with the share link or in the community feed can view and copy this read-only itinerary.'
                        : 'Only you can see this trip. Publish it to get a shareable public link.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {trip.is_public ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const url = `${window.location.origin}/public/trips/${trip.share_slug}`;
                          navigator.clipboard.writeText(url);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2500);
                        }}
                        leftIcon={copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                      >
                        {copiedLink ? 'Link Copied!' : 'Copy Share Link'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => unpublishMutation.mutate()}
                        isLoading={unpublishMutation.isPending}
                      >
                        Unpublish
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => publishMutation.mutate()}
                      isLoading={publishMutation.isPending}
                      leftIcon={<Globe className="w-4 h-4" />}
                    >
                      Publish Trip
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Feature Placeholders for Upcoming Phases */}
            <div className="space-y-6 pt-4">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <span>Trip Workflow Modules</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Itinerary Module Card (ACTIVE) */}
                <div className="bg-surface p-6 rounded-2xl border border-primary-200 shadow-xs space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                      <Map className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900">Itinerary & City Stops</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Add city stops, assign dates, pick catalog activities, and schedule your day-by-day itinerary.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link to={`/trips/${trip.id}/itinerary`}>
                      <Button size="sm" className="w-full">
                        Build Itinerary →
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Budget Module Card (ACTIVE) */}
                <div className="bg-surface p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <PieChart className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900">Expense & Budget Engine</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      View automatic financial calculations, category charts, city cost breakdowns, and budget status.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link to={`/trips/${trip.id}/budget`}>
                      <Button size="sm" variant="outline" className="w-full">
                        View Budget Dashboard →
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Calendar Module Card (ACTIVE) */}
                <div className="bg-surface p-6 rounded-2xl border border-amber-200 shadow-xs space-y-3 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900">Calendar & Timeline</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Visualize your journey on an interactive day-by-day chronological timeline and calendar grid.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link to={`/trips/${trip.id}/calendar`}>
                      <Button size="sm" variant="outline" className="w-full">
                        View Travel Timeline →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Trip"
        message={`Are you sure you want to delete "${trip?.name}"? This will permanently erase the trip and cannot be undone.`}
        confirmText="Delete Trip"
        isLoading={deleteTripMutation.isPending}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </AppLayout>
  );
};
