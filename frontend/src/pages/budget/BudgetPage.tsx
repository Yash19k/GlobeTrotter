import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  PieChart as PieChartIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Building,
  Car,
  Utensils,
  Compass,
  MapPin,
  Clock,
  Map,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
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
import { useTripBudget } from '@/hooks/useTripBudget';
import { formatCurrency, formatDate } from '@/lib/utils';

export const BudgetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tripId = id ? Number(id) : 0;

  const { data: budget, isLoading, isError, error } = useTripBudget(tripId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !budget) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => navigate('/trips')}
            className="inline-flex items-center text-xs font-semibold text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Trips
          </button>
          <Alert
            type="error"
            title="Unable to load budget calculations"
            message={(error as any)?.message || 'Trip not found or permission denied.'}
          />
        </div>
      </AppLayout>
    );
  }

  const totalBudget = Number(budget.total_budget || 0);
  const estimatedTotal = Number(budget.estimated_total || 0);
  const remainingBudget = Number(budget.remaining_budget || 0);
  const isOverBudget = budget.status === 'OVER_BUDGET';
  const isNearLimit = budget.status === 'NEAR_LIMIT';

  // Category Pie Chart Data
  const categoryData = [
    { name: 'Accommodation', value: Number(budget.categories.accommodation || 0), color: '#0d9488', icon: Building },
    { name: 'Activities', value: Number(budget.categories.activities || 0), color: '#0284c7', icon: Compass },
    { name: 'Transport', value: Number(budget.categories.transport || 0), color: '#f59e0b', icon: Car },
    { name: 'Meals', value: Number(budget.categories.meals || 0), color: '#ea580c', icon: Utensils },
    { name: 'Other', value: Number(budget.categories.other || 0), color: '#6b7280', icon: DollarSign },
  ].filter((item) => item.value > 0);

  // Daily Bar Chart Data
  const dailyChartData = budget.days.map((d) => ({
    name: d.label,
    Date: formatDate(d.date),
    Total: Number(d.total_cost || 0),
    Activities: Number(d.activities_cost || 0),
    Fixed: Number(d.fixed_daily_cost || 0),
  }));

  // Visual Progress Bar Cap
  const progressPercent = Math.min(Math.max(budget.budget_used_percentage, 0), 100);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-5">
          <button
            type="button"
            onClick={() => navigate(`/trips/${tripId}`)}
            className="inline-flex items-center text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Trip Overview
          </button>

          <div className="flex items-center space-x-2">
            <Link to={`/trips/${tripId}/itinerary`}>
              <Button size="sm" variant="outline" leftIcon={<Map className="w-4 h-4" />}>
                Itinerary Builder
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Alert Banner */}
        {isOverBudget ? (
          <div className="bg-error-50 border border-error-200 rounded-2xl p-5 flex items-start space-x-3.5 text-error-800 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-error-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">Over Budget Warning</h3>
              <p className="text-xs text-error-700 mt-0.5">
                Your estimated expenses exceed your planned budget by{' '}
                <span className="font-bold">{formatCurrency(Math.abs(remainingBudget))}</span>. Adjust your itinerary stops or increase your trip budget limit.
              </p>
            </div>
          </div>
        ) : isNearLimit ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start space-x-3.5 text-amber-800 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">Approaching Budget Limit</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                You have used <span className="font-bold">{budget.budget_used_percentage}%</span> of your planned budget. You have{' '}
                <span className="font-bold">{formatCurrency(remainingBudget)}</span> remaining.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start space-x-3.5 text-emerald-800 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">Trip Within Budget</h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your trip is currently within budget. You have{' '}
                <span className="font-bold">{formatCurrency(remainingBudget)}</span> available across your {budget.duration_days}-day journey.
              </p>
            </div>
          </div>
        )}

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface rounded-2xl border border-neutral-200 p-5 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Planned Budget</p>
              <p className="text-2xl font-extrabold text-neutral-900">{formatCurrency(totalBudget)}</p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-neutral-200 p-5 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Estimated Total</p>
              <p className="text-2xl font-extrabold text-neutral-900">{formatCurrency(estimatedTotal)}</p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-neutral-200 p-5 shadow-xs flex items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isOverBudget ? 'bg-error-50 text-error-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {isOverBudget ? 'Over Budget By' : 'Remaining Budget'}
              </p>
              <p className={`text-2xl font-extrabold ${isOverBudget ? 'text-error-600' : 'text-emerald-600'}`}>
                {formatCurrency(Math.abs(remainingBudget))}
              </p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-neutral-200 p-5 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Avg Daily Cost</p>
              <p className="text-2xl font-extrabold text-neutral-900">
                {formatCurrency(Number(budget.average_daily_cost))}/day
              </p>
            </div>
          </div>
        </div>

        {/* Budget Usage Progress Bar */}
        <div className="bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
            <span>Budget Allocation Usage</span>
            <span>{budget.budget_used_percentage}% used</span>
          </div>
          <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-error-500' : isNearLimit ? 'bg-amber-500' : 'bg-primary-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main 2-Column Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Category Chart & Table (6 cols) */}
          <div className="lg:col-span-6 bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center space-x-2 border-b border-neutral-100 pb-4">
              <PieChartIcon className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-bold text-neutral-900">Category Cost Breakdown</h2>
            </div>

            {categoryData.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                No planned costs or expenses recorded for this trip yet.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Donut Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [formatCurrency(Number(value || 0)), 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Breakdown Table */}
                <div className="space-y-2 border-t border-neutral-100 pt-4">
                  {categoryData.map((item) => {
                    const pct = estimatedTotal > 0 ? ((item.value / estimatedTotal) * 100).toFixed(1) : '0';
                    const Icon = item.icon;
                    return (
                      <div key={item.name} className="flex items-center justify-between text-xs py-1.5">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <Icon className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="font-semibold text-neutral-800">{item.name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-neutral-500 font-medium">{pct}%</span>
                          <span className="font-bold text-neutral-900 w-20 text-right">{formatCurrency(item.value)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Daily Bar Chart (6 cols) */}
          <div className="lg:col-span-6 bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center space-x-2 border-b border-neutral-100 pb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-bold text-neutral-900">Daily Cost Distribution</h2>
            </div>

            {dailyChartData.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500">No daily breakdown available.</div>
            ) : (
              <div className="space-y-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78716c' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
                      <Tooltip
                        formatter={(value: any) => [formatCurrency(Number(value || 0)), 'Daily Total']}
                      />
                      <Bar dataKey="Total" fill="#0d9488" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 border-t border-neutral-100 pt-4 max-h-48 overflow-y-auto pr-1">
                  {budget.days.map((day) => (
                    <div key={day.date} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100/60 last:border-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-neutral-900">{day.label}</span>
                        <span className="text-neutral-500">({formatDate(day.date)})</span>
                      </div>
                      <span className="font-bold text-neutral-900">{formatCurrency(Number(day.total_cost))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* City / Stop Cost Breakdown Section */}
        <div className="bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-neutral-100 pb-4">
            <MapPin className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-neutral-900">Cost Breakdown by Destination City</h2>
          </div>

          {budget.stops.length === 0 ? (
            <p className="text-xs text-neutral-500 py-4">No city stops added to itinerary yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {budget.stops.map((stop) => (
                <div key={stop.id} className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">{stop.city_name}</h4>
                      <p className="text-[11px] text-neutral-500">{stop.country}</p>
                    </div>
                    <span className="text-sm font-extrabold text-neutral-900">
                      {formatCurrency(Number(stop.total_cost))}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-600 border-t border-neutral-200/60 pt-2.5">
                    <div className="flex justify-between">
                      <span>Transport:</span>
                      <span className="font-medium text-neutral-800">{formatCurrency(Number(stop.transport_cost))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lodging:</span>
                      <span className="font-medium text-neutral-800">{formatCurrency(Number(stop.accommodation_cost))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Activities:</span>
                      <span className="font-medium text-neutral-800">{formatCurrency(Number(stop.activities_cost))}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
