import React, { useState } from 'react';
import { Search, SlidersHorizontal, Compass, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { CityCard } from '@/components/discovery/CityCard';
import { ActivityCard } from '@/components/discovery/ActivityCard';
import { CityDetailModal } from '@/components/discovery/CityDetailModal';
import { ActivityDetailModal } from '@/components/discovery/ActivityDetailModal';
import { TripCardSkeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';

import { useCities } from '@/hooks/useCities';
import { useActivities } from '@/hooks/useActivities';
import { useDebounce } from '@/hooks/useDebounce';
import type { City, Activity } from '@/types';

export const DiscoverPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cities' | 'activities'>('cities');
  const [searchRaw, setSearchRaw] = useState('');
  const debouncedSearch = useDebounce(searchRaw, 350);

  // City Filters State
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCostIndex, setSelectedCostIndex] = useState<number | ''>('');
  const [cityOrdering, setCityOrdering] = useState('-popularity_score');
  const [cityPage, setCityPage] = useState(1);

  // Activity Filters State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxCost, setMaxCost] = useState<number | ''>('');
  const [activityOrdering, setActivityOrdering] = useState('name');
  const [activityPage, setActivityPage] = useState(1);

  // Selection Modals State
  const [selectedCityModal, setSelectedCityModal] = useState<City | null>(null);
  const [selectedActivityModal, setSelectedActivityModal] = useState<Activity | null>(null);

  // Query Hooks
  const cityQueryParams = {
    search: debouncedSearch,
    region: selectedRegion || undefined,
    cost_index: selectedCostIndex || undefined,
    ordering: cityOrdering,
    page: cityPage,
    page_size: 9,
  };

  const activityQueryParams = {
    search: debouncedSearch,
    category: selectedCategory || undefined,
    max_cost: maxCost || undefined,
    ordering: activityOrdering,
    page: activityPage,
    page_size: 9,
  };

  const citiesQuery = useCities(cityQueryParams);
  const activitiesQuery = useActivities(activityQueryParams);

  const resetFilters = () => {
    setSearchRaw('');
    setSelectedRegion('');
    setSelectedCostIndex('');
    setCityOrdering('-popularity_score');
    setCityPage(1);

    setSelectedCategory('');
    setMaxCost('');
    setActivityOrdering('name');
    setActivityPage(1);
  };

  const hasActiveFilters =
    searchRaw || selectedRegion || selectedCostIndex || selectedCategory || maxCost;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-200/80 pb-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Travel Discovery Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Explore Destinations & Activities
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Discover top cities, regional culture, and curated experiences for your itineraries.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="bg-neutral-100 p-1 rounded-xl flex items-center shrink-0 self-start md:self-auto border border-neutral-200">
            <button
              type="button"
              onClick={() => setActiveTab('cities')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cities'
                  ? 'bg-surface text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Destinations
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('activities')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'activities'
                  ? 'bg-surface text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Activities
            </button>
          </div>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="bg-surface rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder={
                  activeTab === 'cities'
                    ? 'Search cities, countries, or regions (e.g. Paris, Japan)...'
                    : 'Search activities or experiences (e.g. museum, ramen, tour)...'
                }
                value={searchRaw}
                onChange={(e) => {
                  setSearchRaw(e.target.value);
                  setCityPage(1);
                  setActivityPage(1);
                }}
                className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              {searchRaw && (
                <button
                  type="button"
                  onClick={() => setSearchRaw('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Clear Filters CTA */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} leftIcon={<X className="w-4 h-4" />}>
                Clear filters
              </Button>
            )}
          </div>

          {/* Filter Options Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-100 text-xs">
            <div className="flex items-center text-neutral-500 font-semibold mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
              Filters:
            </div>

            {activeTab === 'cities' ? (
              <>
                {/* Region Filter */}
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setCityPage(1);
                  }}
                  className="bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-primary-500"
                >
                  <option value="">All Regions</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="Middle East">Middle East</option>
                  <option value="North America">North America</option>
                </select>

                {/* Cost Index Filter */}
                <select
                  value={selectedCostIndex}
                  onChange={(e) => {
                    setSelectedCostIndex(e.target.value ? Number(e.target.value) : '');
                    setCityPage(1);
                  }}
                  className="bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-primary-500"
                >
                  <option value="">All Cost Levels</option>
                  <option value="1">$ Budget (1/5)</option>
                  <option value="2">$$ Affordable (2/5)</option>
                  <option value="3">$$$ Moderate (3/5)</option>
                  <option value="4">$$$$ Premium (4/5)</option>
                  <option value="5">$$$$$ Luxury (5/5)</option>
                </select>

                {/* Ordering */}
                <div className="ml-auto flex items-center space-x-2">
                  <span className="text-neutral-400 font-medium">Sort by:</span>
                  <select
                    value={cityOrdering}
                    onChange={(e) => setCityOrdering(e.target.value)}
                    className="bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-primary-500"
                  >
                    <option value="-popularity_score">Most Popular</option>
                    <option value="popularity_score">Least Popular</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="-name">Name (Z-A)</option>
                    <option value="cost_index">Cost (Low to High)</option>
                    <option value="-cost_index">Cost (High to Low)</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setActivityPage(1);
                  }}
                  className="bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-primary-500"
                >
                  <option value="">All Categories</option>
                  <option value="SIGHTSEEING">Sightseeing</option>
                  <option value="FOOD">Food & Dining</option>
                  <option value="ADVENTURE">Adventure</option>
                  <option value="CULTURE">Culture & History</option>
                  <option value="SHOPPING">Shopping</option>
                  <option value="NIGHTLIFE">Nightlife</option>
                  <option value="NATURE">Nature & Outdoors</option>
                </select>

                {/* Max Cost Filter */}
                <select
                  value={maxCost}
                  onChange={(e) => {
                    setMaxCost(e.target.value ? Number(e.target.value) : '');
                    setActivityPage(1);
                  }}
                  className="bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-primary-500"
                >
                  <option value="">Any Cost</option>
                  <option value="0">Free ($0)</option>
                  <option value="25">Under $25</option>
                  <option value="50">Under $50</option>
                  <option value="100">Under $100</option>
                </select>

                {/* Ordering */}
                <div className="ml-auto flex items-center space-x-2">
                  <span className="text-neutral-400 font-medium">Sort by:</span>
                  <select
                    value={activityOrdering}
                    onChange={(e) => setActivityOrdering(e.target.value)}
                    className="bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-primary-500"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="-name">Name (Z-A)</option>
                    <option value="estimated_cost">Price (Low to High)</option>
                    <option value="-estimated_cost">Price (High to Low)</option>
                    <option value="duration_minutes">Duration (Shortest)</option>
                    <option value="-duration_minutes">Duration (Longest)</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content Section */}
        {activeTab === 'cities' ? (
          <div>
            {citiesQuery.isError && (
              <Alert
                type="error"
                title="Failed to load destinations"
                message={(citiesQuery.error as any)?.message || 'Unable to connect to discovery server.'}
              />
            )}

            {citiesQuery.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <TripCardSkeleton />
                <TripCardSkeleton />
                <TripCardSkeleton />
              </div>
            ) : citiesQuery.data?.results.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-dashed border-neutral-300 p-12 text-center max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">No destinations found</h3>
                <p className="text-sm text-neutral-600 mt-1 mb-6">
                  No cities match your current search query or filter criteria.
                </p>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear Search & Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {citiesQuery.data?.results.map((city) => (
                    <CityCard key={city.id} city={city} onSelect={(c) => setSelectedCityModal(c)} />
                  ))}
                </div>

                {/* Pagination Footer */}
                {citiesQuery.data && citiesQuery.data.count > 9 && (
                  <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
                    <span className="text-xs text-neutral-500 font-medium">
                      Showing {citiesQuery.data.results.length} of {citiesQuery.data.count} cities
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!citiesQuery.data.previous}
                        onClick={() => setCityPage((prev) => Math.max(prev - 1, 1))}
                        leftIcon={<ChevronLeft className="w-4 h-4" />}
                      >
                        Previous
                      </Button>
                      <span className="text-xs font-semibold text-neutral-700 px-2">Page {cityPage}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!citiesQuery.data.next}
                        onClick={() => setCityPage((prev) => prev + 1)}
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            {activitiesQuery.isError && (
              <Alert
                type="error"
                title="Failed to load activities"
                message={(activitiesQuery.error as any)?.message || 'Unable to connect to discovery server.'}
              />
            )}

            {activitiesQuery.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <TripCardSkeleton />
                <TripCardSkeleton />
                <TripCardSkeleton />
              </div>
            ) : activitiesQuery.data?.results.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-dashed border-neutral-300 p-12 text-center max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">No activities found</h3>
                <p className="text-sm text-neutral-600 mt-1 mb-6">
                  No activities match your current search query or filter criteria.
                </p>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear Search & Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activitiesQuery.data?.results.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} onSelect={(a) => setSelectedActivityModal(a)} />
                  ))}
                </div>

                {/* Pagination Footer */}
                {activitiesQuery.data && activitiesQuery.data.count > 9 && (
                  <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
                    <span className="text-xs text-neutral-500 font-medium">
                      Showing {activitiesQuery.data.results.length} of {activitiesQuery.data.count} activities
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!activitiesQuery.data.previous}
                        onClick={() => setActivityPage((prev) => Math.max(prev - 1, 1))}
                        leftIcon={<ChevronLeft className="w-4 h-4" />}
                      >
                        Previous
                      </Button>
                      <span className="text-xs font-semibold text-neutral-700 px-2">Page {activityPage}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!activitiesQuery.data.next}
                        onClick={() => setActivityPage((prev) => prev + 1)}
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CityDetailModal city={selectedCityModal} onClose={() => setSelectedCityModal(null)} />
      <ActivityDetailModal activity={selectedActivityModal} onClose={() => setSelectedActivityModal(null)} />
    </AppLayout>
  );
};
