import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [forgotNotice, setForgotNotice] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    setForgotNotice(false);
    try {
      const response = await authService.login(data);
      setAuth(response.user, {
        access: response.access,
        refresh: response.refresh,
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setApiError(err.response.data.detail);
      } else if (err.response?.status === 401) {
        setApiError('Email or password is incorrect.');
      } else {
        setApiError('Unable to sign in. Please check your internet connection or try again later.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/login" className="inline-block mb-4">
          <img
            src="/logo.png"
            alt="GlobeTrotter"
            className="h-10 sm:h-12 w-auto mx-auto object-contain"
          />
        </Link>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Sign in to access your travel itineraries and trip plans
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface py-8 px-6 sm:px-10 shadow-md rounded-2xl border border-neutral-200">
          {apiError && <Alert type="error" message={apiError} className="mb-6" />}

          {forgotNotice && (
            <Alert
              type="info"
              message="Password recovery is disabled in this MVP version. Please register a new account if needed."
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-xs text-neutral-600">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotNotice(true)}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full py-3 font-semibold">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-neutral-100 pt-6">
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
