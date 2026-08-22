import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { TripForm } from '@/components/trip/TripForm';
import { useCreateTrip } from '@/hooks/useTrips';
import type { TripFormData } from '@/lib/validations/trip';

export const CreateTripPage: React.FC = () => {
  const navigate = useNavigate();
  const createTripMutation = useCreateTrip();
  const [apiError, setApiError] = useState<string | null>(null);

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
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </button>

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
      </div>
    </AppLayout>
  );
};
