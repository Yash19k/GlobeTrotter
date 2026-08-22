import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { TripForm } from '@/components/trip/TripForm';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTrip, useUpdateTrip } from '@/hooks/useTrips';
import type { TripFormData } from '@/lib/validations/trip';

export const EditTripPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: trip, isLoading, isError, error } = useTrip(id);
  const updateTripMutation = useUpdateTrip();
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (data: TripFormData) => {
    if (!id) return;
    setApiError(null);
    try {
      await updateTripMutation.mutateAsync({
        id,
        payload: {
          name: data.name,
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
          total_budget: data.total_budget,
          cover_image: data.cover_image,
        },
      });
      navigate(`/trips/${id}`);
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object' && !Array.isArray(errorData)) {
          const firstKey = Object.keys(errorData)[0];
          const firstVal = errorData[firstKey];
          setApiError(`${firstKey}: ${Array.isArray(firstVal) ? firstVal[0] : firstVal}`);
        } else {
          setApiError('Failed to update trip.');
        }
      } else {
        setApiError('Network error. Unable to save changes.');
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
          Back to Trip Details
        </button>

        {isLoading ? (
          <div className="bg-surface rounded-2xl border border-neutral-200 p-8 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError || !trip ? (
          <Alert
            type="error"
            title="Trip Not Found"
            message={(error as any)?.message || 'The requested trip does not exist or you do not have permission.'}
          />
        ) : (
          <div className="bg-surface rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 border-b border-neutral-100 pb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                  Edit "{trip.name}"
                </h1>
                <p className="text-xs text-neutral-500">
                  Update travel dates, budget limits, or trip details.
                </p>
              </div>
            </div>

            <TripForm
              initialData={trip}
              isEditMode={true}
              isSubmitting={updateTripMutation.isPending}
              apiError={apiError}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/trips/${id}`)}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
};
