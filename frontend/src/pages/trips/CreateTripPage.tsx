import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass, Sparkles, MapPin } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { TripForm } from '@/components/trip/TripForm';
import { useCreateTrip } from '@/hooks/useTrips';
import { useCities } from '@/hooks/useCities';
import { useActivities } from '@/hooks/useActivities';
import type { TripFormData } from '@/lib/validations/trip';

export const CreateTripPage: React.FC = () => {
  const navigate = useNavigate();
  const createTripMutation = useCreateTrip();
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: popularCities } = useCities({ page_size: 6, ordering: '-popularity_score' });
  const { data: popularActivities } = useActivities({ page_size: 6, ordering: '-estimated_cost' });

  const handleSubmit = async (data: TripFormData) => {
    setApiError(null);
    try {
      const newTrip = await createTripMutation.mutateAsync({
        name: data.name,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        total_budget: data.total_budget,
        cover_image: data.cover_image,
      });
      navigate(`/trips/${newTrip.id}`);
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object' && !Array.isArray(errorData)) {
          const firstKey = Object.keys(errorData)[0];
          const firstVal = errorData[firstKey];
          setApiError(`${firstKey}: ${Array.isArray(firstVal) ? firstVal[0] : firstVal}`);
        } else {
          setApiError('Failed to create trip. Please verify your input.');
        }
      } else {
        setApiError('Network error. Unable to save trip.');
      }
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </button>

        {/* Plan Trip Form Card */}
        <div className="bg-surface rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 border-b border-neutral-100 pb-5">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Plan a New Trip
              </h1>
              <p className="text-xs text-neutral-500">
                Define your trip name, travel dates, and initial budget estimate.
              </p>
            </div>
          </div>

          <TripForm
            isEditMode={false}
            isSubmitting={createTripMutation.isPending}
            apiError={apiError}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/trips')}
          />
        </div>

        {/* Suggestions Section matching Wireframe Screen 4 */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2 border-b border-neutral-200/80 pb-3">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <h2 className="text-base font-bold text-neutral-900">
              Suggestions for Places to Visit & Activities to Perform
            </h2>
          </div>

          {/* Place Suggestion Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(popularCities?.results || []).slice(0, 6).map((city) => (
              <div
                key={city.id}
                className="group bg-surface rounded-xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all p-2 flex flex-col justify-between"
              >
                <div className="h-24 rounded-lg overflow-hidden relative bg-neutral-100">
                  <img
                    src={city.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=300&q=80'}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1 right-1 bg-neutral-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    ★ {city.popularity_score}
                  </span>
                </div>
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-neutral-900 truncate">{city.name}</h4>
                  <p className="text-[10px] text-neutral-500 truncate">{city.country}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Popular Activities Quick Chips */}
          <div className="bg-surface rounded-xl border border-neutral-200 p-4 space-y-2">
            <p className="text-xs font-semibold text-neutral-700">Top Recommended Activities for New Itineraries:</p>
            <div className="flex flex-wrap gap-2">
              {(popularActivities?.results || []).slice(0, 6).map((act) => (
                <span
                  key={act.id}
                  className="inline-flex items-center text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-primary-50 hover:text-primary-700 px-3 py-1 rounded-lg border border-neutral-200 transition-colors"
                >
                  <MapPin className="w-3 h-3 mr-1 text-primary-500" />
                  {act.name} (${act.estimated_cost})
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

