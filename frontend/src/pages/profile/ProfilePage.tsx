import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserIcon, Mail, Phone, MapPin, Globe, Image as ImageIcon, Save, CheckCircle, ShieldCheck } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { formatDate } from '@/lib/utils';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(150),
  last_name: z.string().max(150).optional(),
  phone: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  profile_image: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { data: user, isLoading, isError } = useProfile();
  const updateMutation = useUpdateProfile();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      city: '',
      country: '',
      profile_image: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || '',
        profile_image: user.profile_image || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateMutation.mutateAsync(data);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      // Handled by mutation error state
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !user) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto py-12">
          <Alert type="error" title="Failed to load profile" message="Unable to fetch user account details." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Header Hero */}
        <div className="bg-surface rounded-3xl border border-neutral-200 p-8 shadow-xs flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 border-2 border-primary-200 text-primary-700 flex items-center justify-center font-extrabold text-2xl overflow-hidden shrink-0 shadow-xs">
            {user.profile_image ? (
              <img src={user.profile_image} alt={user.first_name} className="w-full h-full object-cover" />
            ) : (
              <span>{user.first_name ? user.first_name[0].toUpperCase() : user.email[0].toUpperCase()}</span>
            )}
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-xs text-neutral-500">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start space-x-2 pt-1 text-[11px] font-semibold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Account • Member since {formatDate(user.created_at || '2026-01-01')}</span>
            </div>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-surface rounded-2xl border border-neutral-200 p-8 shadow-xs space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-lg font-bold text-neutral-900">Personal Information</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Update your personal profile details across GlobeTrotter.
            </p>
          </div>

          {/* Account Read-only Email */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-1">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Account Email
            </label>
            <div className="flex items-center text-sm font-bold text-neutral-900 space-x-2">
              <Mail className="w-4 h-4 text-neutral-400" />
              <span>{user.email}</span>
              <span className="text-[10px] bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded font-semibold ml-auto">
                Read Only
              </span>
            </div>
          </div>

          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="e.g. Alice"
              error={errors.first_name?.message}
              leftIcon={<UserIcon className="w-4 h-4 text-neutral-400" />}
              {...register('first_name')}
            />

            <Input
              label="Last Name"
              placeholder="e.g. Smith"
              error={errors.last_name?.message}
              leftIcon={<UserIcon className="w-4 h-4 text-neutral-400" />}
              {...register('last_name')}
            />
          </div>

          {/* Phone & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              error={errors.phone?.message}
              leftIcon={<Phone className="w-4 h-4 text-neutral-400" />}
              {...register('phone')}
            />

            <Input
              label="City"
              placeholder="e.g. San Francisco"
              error={errors.city?.message}
              leftIcon={<MapPin className="w-4 h-4 text-neutral-400" />}
              {...register('city')}
            />
          </div>

          {/* Country & Profile Avatar URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Country"
              placeholder="e.g. United States"
              error={errors.country?.message}
              leftIcon={<Globe className="w-4 h-4 text-neutral-400" />}
              {...register('country')}
            />

            <Input
              label="Avatar Image URL"
              placeholder="https://..."
              error={errors.profile_image?.message}
              leftIcon={<ImageIcon className="w-4 h-4 text-neutral-400" />}
              {...register('profile_image')}
            />
          </div>

          {/* Mutation Error */}
          {updateMutation.isError && (
            <Alert
              type="error"
              title="Update failed"
              message={(updateMutation.error as any)?.response?.data?.detail || 'Unable to update profile.'}
            />
          )}

          {/* Submit Action */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end">
            <Button
              type="submit"
              disabled={!isDirty}
              isLoading={updateMutation.isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
