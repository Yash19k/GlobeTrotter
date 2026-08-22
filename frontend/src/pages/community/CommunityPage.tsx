import React, { useState } from 'react';
import { Search, Compass, ChevronLeft, ChevronRight } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { CommunityTripCard } from '@/components/community/CommunityTripCard';
import { useCommunityTrips } from '@/hooks/usePublicSharing';
import { useDebounce } from '@/hooks/useDebounce';

export const CommunityPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, error, refetch } = useCommunityTrips(page, debouncedSearch);

  const trips = data?.results || [];
  const totalCount = data?.count || 0;
  const hasNext = !!data?.next;
  const hasPrev = !!data?.previous;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Community Hero */}
        <div className="bg-surface rounded-3xl border border-neutral-200 p-8 shadow-xs space-y-4 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Community Discovery
            </span>
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              Travel Plans Worth Stealing
            </h1>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Explore real multi-city itineraries created by the GlobeTrotter community. Copy any public trip directly into your account to customize and make it your own.
            </p>
          </div>

          {/* Search Input */}
          <div className="max-w-md pt-2">
            <Input
              placeholder="Search by trip title or city (e.g. Paris, Rome)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="w-4 h-4 text-neutral-400" />}
            />
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : isError ? (
          <div className="space-y-4">
            <Alert
              type="error"
              title="Unable to load community trips"
              message={(error as any)?.message || 'Failed to connect to community feed.'}
            />
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : trips.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-surface rounded-2xl border border-neutral-200 p-8">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">No Public Trips Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {search ? `No trips matching "${search}". Try searching for another city or title.` : 'Be the first traveler to publish an itinerary to the community!'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Showing {trips.length} of {totalCount} public itineraries</span>
              <span>Page {page}</span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <CommunityTripCard key={trip.id} trip={trip} />
              ))}
            </div>

            {/* Pagination Controls */}
            {(hasNext || hasPrev) && (
              <div className="flex items-center justify-center space-x-4 pt-4 border-t border-neutral-200">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!hasPrev}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>

                <span className="text-xs font-semibold text-neutral-700">Page {page}</span>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={!hasNext}
                  onClick={() => setPage((p) => p + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
