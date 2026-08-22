import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Sliders, LogOut, ChevronRight, CheckCircle, Globe, DollarSign } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [savedPreferencesMsg, setSavedPreferencesMsg] = useState<string | null>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedPreferencesMsg('Preferences saved locally!');
    setTimeout(() => setSavedPreferencesMsg(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Header Hero */}
        <div className="bg-surface rounded-3xl border border-neutral-200 p-8 shadow-xs space-y-2">
          <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Account & Application Settings
          </span>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-sm text-neutral-600">
            Manage your account details, regional preferences, and active user session.
          </p>
        </div>

        {/* Success Alert Banner */}
        {savedPreferencesMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedPreferencesMsg}</span>
          </div>
        )}

        {/* Section 1: Profile Link Card */}
        <div className="bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 border border-primary-200 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'User Profile'}
              </h3>
              <p className="text-xs text-neutral-500">{user?.email}</p>
            </div>
          </div>

          <Link to="/profile">
            <Button size="sm" variant="outline" rightIcon={<ChevronRight className="w-4 h-4" />}>
              Manage Profile
            </Button>
          </Link>
        </div>

        {/* Section 2: Preferences Form */}
        <form onSubmit={handleSavePreferences} className="bg-surface rounded-2xl border border-neutral-200 p-8 shadow-xs space-y-6">
          <div className="border-b border-neutral-100 pb-4 flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-primary-600" />
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Travel & Regional Preferences</h2>
              <p className="text-xs text-neutral-500">Configure default display values for currencies and language.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 flex items-center space-x-1.5">
                <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
                <span>Preferred Currency</span>
              </label>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-neutral-400" />
                <span>Preferred Language</span>
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="en">English (US)</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-end">
            <Button type="submit" size="sm">
              Save Preferences
            </Button>
          </div>
        </form>

        {/* Section 3: Account & Session */}
        <div className="bg-surface rounded-2xl border border-neutral-200 p-8 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="text-lg font-bold text-neutral-900">Account Session</h2>
            <p className="text-xs text-neutral-500">Sign out of your active GlobeTrotter session on this browser.</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-bold text-neutral-800">Active Session</p>
              <p className="text-xs text-neutral-500">Logged in as {user?.email}</p>
            </div>

            <Button size="sm" variant="danger" onClick={handleLogout} leftIcon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
