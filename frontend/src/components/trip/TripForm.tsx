import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, DollarSign, Image as ImageIcon, MapPin } from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { tripSchema, type TripFormData } from '@/lib/validations/trip';
import type { Trip } from '@/types';

interface TripFormProps {
  initialData?: Partial<Trip>;
  isEditMode?: boolean;
  isSubmitting?: boolean;
  apiError?: string | null;
  onSubmit: (data: TripFormData) => Promise<void>;
  onCancel?: () => void;
}

export const TripForm: React.FC<TripFormProps> = ({
  initialData,
  isEditMode = false,
  isSubmitting = false,
  apiError = null,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || '',
      total_budget: initialData?.total_budget ? Number(initialData.total_budget) : 1000,
      cover_image: initialData?.cover_image || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {apiError && <Alert type="error" message={apiError} />}

      <Input
        label="Trip Title *"
        placeholder="e.g. European Summer Exploration"
        leftIcon={<MapPin className="w-4 h-4" />}
        error={errors.name?.message}
        {...register('name')}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1.5">
          Description / Notes
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Brief summary of your travel goals, highlights, or ideas..."
          className="w-full rounded-lg border border-neutral-300 bg-surface px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          {...register('description')}
        />
        {errors.description?.message && (
          <p className="mt-1.5 text-xs font-medium text-error-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Start Date *"
          type="date"
          leftIcon={<Calendar className="w-4 h-4" />}
          error={errors.start_date?.message}
          {...register('start_date')}
        />

        <Input
          label="End Date *"
          type="date"
          leftIcon={<Calendar className="w-4 h-4" />}
          error={errors.end_date?.message}
          {...register('end_date')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Total Budget ($ USD) *"
          type="number"
          step="0.01"
          placeholder="1500.00"
          leftIcon={<DollarSign className="w-4 h-4" />}
          error={errors.total_budget?.message}
          {...register('total_budget')}
        />

        <Input
          label="Cover Image URL (optional)"
          type="url"
          placeholder="https://images.unsplash.com/..."
          leftIcon={<ImageIcon className="w-4 h-4" />}
          error={errors.cover_image?.message}
          helperText="Paste an image URL or leave empty for default cover."
          {...register('cover_image')}
        />
      </div>

      <div className="pt-4 flex items-center justify-end space-x-3 border-t border-neutral-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting} className="min-w-[140px]">
          {isSubmitting
            ? isEditMode
              ? 'Saving...'
              : 'Creating...'
            : isEditMode
            ? 'Save Changes'
            : 'Create Trip'}
        </Button>
      </div>
    </form>
  );
};
