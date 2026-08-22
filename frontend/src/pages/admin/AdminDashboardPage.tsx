import React, { useState, useMemo } from 'react';
import {
  Users,
  MapPin,
  Compass,
  DollarSign,
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAnalytics } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/lib/utils';

type AdminTab = 'users' | 'cities' | 'activities' | 'trends';

const PIE_COLORS = ['#0d9488', '#0284c7', '#f59e0b', '#ea580c', '#8b5cf6', '#ec4899', '#10b981', '#64748b'];

export const AdminDashboardPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useAnalytics();
  const [activeTab, setActiveTab] = useState<AdminTab>('trends');
  const [searchQuery, setSearchQuery] = useState('');

  const overview = data?.overview;
  const popularCities = data?.popular_cities || [];
  const popularActivities = data?.popular_activities || [];
  const categoryDistribution = data?.category_distribution || [];
  const trends = data?.trends || [];
  const users = data?.users || [];

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.city && u.city.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, searchQuery]);

  // Filtered Cities
  const filteredCities = useMemo(() => {
    return popularCities.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.region.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [popularCities, searchQuery]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return popularActivities.filter(
      (a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.city_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [popularActivities, searchQuery]);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-200/80 pb-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin & Analytics Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Platform Overview & Trends
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Monitor app adoption, destination popularity, user activity, and travel trends.
            </p>
          </div>

          {/* Quick Refresh */}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh Metrics
          </Button>
        </div>

        {/* Global Toolbar matching Screen 12 wireframe */}
        <div className="bg-surface rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search users, cities, activities, or metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Tab Navigation Buttons */}
            <div className="bg-neutral-100 p-1 rounded-xl flex items-center border border-neutral-200 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'users' ? 'bg-surface text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Manage Users
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cities')}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'cities' ? 'bg-surface text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Popular Cities
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('activities')}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'activities' ? 'bg-surface text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Popular Activities
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trends')}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'trends' ? 'bg-surface text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                User Trends & Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Error / Loading State */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        ) : isError ? (
          <Alert
            type="error"
            title="Failed to load analytics"
            message={(error as any)?.message || 'Unable to connect to analytics service.'}
          />
        ) : (
          <div className="space-y-8">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface rounded-2xl border border-neutral-200 p-5 shadow-xs flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Travelers</p>
                  <p className="text-2xl font-bold text-neutral-900">{overview?.total_users || 0}</p>
                  <p className="text-[11px] text-emerald-600 font-medium">{overview?.active_users || 0} active</p>
                </div>
              </div>

              <div className="bg-surface rounded-2xl border border-neutral-200 p-5 shadow-xs flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Itineraries</p>
                  <p className="text-2xl font-bold text-neutral-900">{overview?.total_trips || 0}</p>
                  <p className="text-[11px] text-teal-600 font-medium">{overview?.public_trips || 0} public</p>
                </div>
              </div>

              <div className="bg-surface rounded-2xl border border-neutral-200 p-5 shadow-xs flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Planned Volume</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {formatCurrency(overview?.total_budget_planned || 0)}
                  </p>
                  <p className="text-[11px] text-amber-600 font-medium">
                    Avg {formatCurrency(overview?.avg_trip_budget || 0)}/trip
                  </p>
                </div>
              </div>

              <div className="bg-surface rounded-2xl border border-neutral-200 p-5 shadow-xs flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Catalog Inventory</p>
                  <p className="text-2xl font-bold text-neutral-900">{overview?.total_destinations || 0} Cities</p>
                  <p className="text-[11px] text-sky-600 font-medium">{overview?.total_activities || 0} Experiences</p>
                </div>
              </div>
            </div>

            {/* TAB 1: USER TRENDS & ANALYTICS */}
            {activeTab === 'trends' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Line Chart: User Growth & Trip Volume */}
                  <div className="lg:col-span-8 bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-neutral-900">Platform Growth Trends</h3>
                        <p className="text-xs text-neutral-500">Trip creations and user onboarding over time</p>
                      </div>
                      <div className="flex items-center space-x-4 text-xs font-medium">
                        <span className="flex items-center text-primary-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary-600 mr-1.5" />
                          Users
                        </span>
                        <span className="flex items-center text-amber-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" />
                          Trips
                        </span>
                      </div>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#78716c' }} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: '#78716c' }} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: '0.75rem',
                              border: '1px solid #e7e5e4',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="users"
                            stroke="#0d9488"
                            strokeWidth={3}
                            dot={{ fill: '#0d9488', r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="trips"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            dot={{ fill: '#f59e0b', r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie Chart: Activity Category Breakdown */}
                  <div className="lg:col-span-4 bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">Experience Categories</h3>
                      <p className="text-xs text-neutral-500">Distribution across activity types</p>
                    </div>

                    <div className="h-64 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="count"
                            nameKey="category"
                          >
                            {categoryDistribution.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [`${value} experiences`, String(name)]}
                            contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e7e5e4' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Bar Chart: City Popularity Index */}
                <div className="bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">Top Visited Cities (Itinerary Stops)</h3>
                    <p className="text-xs text-neutral-500">Number of traveler itineraries including each city</p>
                  </div>

                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={popularCities} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#78716c' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#78716c' }} tickLine={false} />
                        <Tooltip
                          formatter={(val) => [`${val} stops planned`, 'Visits']}
                          contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e7e5e4' }}
                        />
                        <Bar dataKey="visits_count" fill="#0d9488" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MANAGE USERS */}
            {activeTab === 'users' && (
              <div className="bg-surface rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">Registered Users Roster</h3>
                    <p className="text-xs text-neutral-500">View user accounts, roles, and created trip volume</p>
                  </div>
                  <span className="text-xs font-semibold text-neutral-500">{filteredUsers.length} accounts found</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                      <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Trips Created</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="p-4 font-bold text-neutral-900">
                            <div>{u.first_name} {u.last_name}</div>
                            <div className="text-[11px] font-normal text-neutral-500">{u.email}</div>
                          </td>
                          <td className="p-4 text-neutral-600">
                            {u.city ? `${u.city}, ${u.country || ''}` : 'Not specified'}
                          </td>
                          <td className="p-4 font-semibold text-neutral-900">
                            <span className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full text-[11px]">
                              {u.trips_count} trips
                            </span>
                          </td>
                          <td className="p-4">
                            {u.is_staff ? (
                              <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                ADMIN / STAFF
                              </span>
                            ) : (
                              <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-[10px] font-medium">
                                TRAVELER
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {u.is_active ? (
                              <span className="inline-flex items-center text-emerald-600 font-medium">
                                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-neutral-400 font-medium">
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Disabled
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-neutral-500">{u.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: POPULAR CITIES */}
            {activeTab === 'cities' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-900">Most Popular Destination Cities</h3>
                  <span className="text-xs text-neutral-500">Ranked by traveler itineraries and popularity score</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredCities.map((city, idx) => (
                    <div
                      key={city.id}
                      className="bg-surface rounded-2xl border border-neutral-200 overflow-hidden shadow-xs space-y-3 p-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="relative h-36 rounded-xl overflow-hidden bg-neutral-100">
                          <img
                            src={city.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80'}
                            alt={city.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 bg-neutral-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            #{idx + 1} Rank
                          </span>
                          <span className="absolute bottom-2 right-2 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {city.popularity_score} / 10 ★
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-neutral-900">{city.name}</h4>
                          <p className="text-xs text-neutral-500">{city.country} • {city.region}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                        <span className="text-neutral-500">Cost Level: {'$'.repeat(city.cost_index)}</span>
                        <span className="font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                          {city.visits_count} visits
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: POPULAR ACTIVITIES */}
            {activeTab === 'activities' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-900">Top Scheduled Activities & Experiences</h3>
                  <span className="text-xs text-neutral-500">Most frequently booked into day-wise plans</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredActivities.map((act) => (
                    <div
                      key={act.id}
                      className="bg-surface rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full uppercase">
                          {act.category}
                        </span>
                        <h4 className="text-sm font-bold text-neutral-900 leading-snug">{act.name}</h4>
                        <p className="text-xs text-neutral-500 flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                          {act.city_name}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-600">${act.estimated_cost}</span>
                        <span className="font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                          {act.scheduled_count} scheduled
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
