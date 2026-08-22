import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Compass, Mail, Lock, User as UserIcon, Phone, MapPin, Globe, Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      city: '',
      country: '',
      password: '',
      password_confirm: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      const response = await authService.register(data);
      setAuth(response.user, response.tokens);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      if (err.response?.data) {
        const serverErrors = err.response.data;
        if (serverErrors.email) {
          setError('email', {
            type: 'manual',
            message: Array.isArray(serverErrors.email) ? serverErrors.email[0] : serverErrors.email,
          });
        } else if (serverErrors.detail) {
          setApiError(serverErrors.detail);
        } else {
          setApiError('Unable to create your account. Please check the highlighted fields.');
        }
      } else {
        setApiError('Network error. Please check your connection and try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 mb-4 shadow-sm">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          Create your GlobeTrotter account
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Start planning personalized multi-city trips and day-wise itineraries
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-surface py-8 px-6 sm:px-10 shadow-md rounded-2xl border border-neutral-200">
          {apiError && <Alert type="error" message={apiError} className="mb-6" />}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First name"
                placeholder="John"
                leftIcon={<UserIcon className="w-4 h-4" />}
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                label="Last name"
                placeholder="Doe"
                leftIcon={<UserIcon className="w-4 h-4" />}
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Phone (optional)"
                placeholder="+1 555 0199"
                leftIcon={<Phone className="w-4 h-4" />}
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input
                label="City (optional)"
                placeholder="San Francisco"
                leftIcon={<MapPin className="w-4 h-4" />}
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="Country (optional)"
                placeholder="United States"
                leftIcon={<Globe className="w-4 h-4" />}
                error={errors.country?.message}
                {...register('country')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={errors.password_confirm?.message}
                {...register('password_confirm')}
              />
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full py-3 font-semibold mt-4">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-neutral-100 pt-6">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
