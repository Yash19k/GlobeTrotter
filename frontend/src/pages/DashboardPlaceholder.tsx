import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, LogOut, User as UserIcon, CheckCircle, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import type { User } from '@/types';

export const DashboardPlaceholder: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [testedUser, setTestedUser] = useState<User | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTestMeEndpoint = async () => {
    setIsTesting(true);
    setTestSuccess(false);
    try {
      const data = await authService.getMe();
      setTestedUser(data);
      setTestSuccess(true);
    } catch {
      setTestSuccess(false);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navbar */}
      <header className="bg-surface border-b border-neutral-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 leading-none">GlobeTrotter</h1>
            <span className="text-xs text-neutral-500 font-medium">Travel Planning Platform</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-sm text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
            <UserIcon className="w-4 h-4 text-neutral-500" />
            <span className="font-semibold">{user?.first_name || user?.email}</span>
            <span className="text-xs text-neutral-400">({user?.email})</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Log out
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6">
        <div className="bg-surface rounded-2xl border border-neutral-200 p-8 shadow-sm mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <ShieldCheck className="w-7 h-7 text-primary-600" />
            <h2 className="text-xl font-bold text-neutral-900">
              Authentication Foundation Ready
            </h2>
          </div>

          <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
            Welcome, <strong className="text-neutral-900">{user?.first_name} {user?.last_name}</strong>! You have successfully authenticated using JWT tokens via Django REST Framework & SimpleJWT against PostgreSQL.
          </p>

          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
              Authenticated Session Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-neutral-500">Email:</span>{' '}
                <strong className="text-neutral-800">{user?.email}</strong>
              </div>
              <div>
                <span className="text-neutral-500">User ID:</span>{' '}
                <strong className="text-neutral-800">{user?.id}</strong>
              </div>
              <div>
                <span className="text-neutral-500">City / Country:</span>{' '}
                <strong className="text-neutral-800">
                  {user?.city || 'N/A'}, {user?.country || 'N/A'}
                </strong>
              </div>
              <div>
                <span className="text-neutral-500">Phone:</span>{' '}
                <strong className="text-neutral-800">{user?.phone || 'N/A'}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              isLoading={isTesting}
              onClick={handleTestMeEndpoint}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Test GET /api/v1/auth/me/
            </Button>
          </div>

          {testSuccess && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">JWT Bearer Auth Verification Passed!</p>
                <p className="text-xs text-emerald-700 mt-1">
                  Response from backend: {JSON.stringify(testedUser)}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
