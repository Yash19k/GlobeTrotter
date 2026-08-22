import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  Calendar as CalendarIcon,
  MapPin,
  DollarSign,
  Copy,
  Share2,
  Check,
  User as UserIcon,
  ArrowLeft,
  PieChart,
} from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePublicTrip, useCopyTrip } from '@/hooks/usePublicSharing';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency, formatDate } from '@/lib/utils';

export const PublicTripPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copySuccessMsg, setCopySuccessMsg] = useState<string | null>(null);

  const { data: publicData, isLoading, isError, error } = usePublicTrip(slug);
  const copyMutation = useCopyTrip();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !publicData) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-2xl mx-auto py-12 text-center">
          <Alert
            type="error"
            title="Public itinerary not found"
            message={(error as any)?.message || 'This trip is either private or does not exist.'}
          />
          <Link to="/community">
            <Button size="sm" variant="outline">
              Explore Community Trips →
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const { trip, creator, stops, budget_summary } = publicData;

  const handleCopyLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyTrip = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const newTrip = await copyMutation.mutateAsync(slug!);
      setCopySuccessMsg(`Trip copied to your account!`);
      setTimeout(() => {
        navigate(`/trips/${newTrip.id}`);
      }, 1200);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to copy trip.');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/community"
            className="inline-flex items-center text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Explore Community Trips
          </Link>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              leftIcon={copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            >
              {copiedLink ? 'Link Copied!' : 'Share Link'}
            </Button>

            <Button
              size="sm"
              onClick={handleCopyTrip}
              isLoading={copyMutation.isPending}
              leftIcon={<Copy className="w-4 h-4" />}
            >
              Copy this Trip
            </Button>
          </div>
        </div>

        {/* Copy Success Banner */}
        {copySuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <span>{copySuccessMsg} Opening your trip...</span>
          </div>
        )}

        {/* Hero Section */}
        <div className="bg-surface rounded-3xl border border-neutral-200 p-8 shadow-xs space-y-6 relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Public Travel Plan
              </span>
              <span className="text-xs text-neutral-500">• {trip.duration_days} Days</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              {trip.name}
            </h1>

            {trip.description && (
              <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed">
                {trip.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-neutral-100 text-xs font-semibold text-neutral-700">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                <UserIcon className="w-4 h-4" />
              </div>
              <span>Planned by <strong className="text-neutral-900">{creator.first_name}</strong></span>
            </div>

            <div className="flex items-center space-x-1.5 text-neutral-600">
              <CalendarIcon className="w-4 h-4 text-neutral-400" />
              <span>{formatDate(trip.start_date)} – {formatDate(trip.end_date)}</span>
            </div>

            {budget_summary && (
              <div className="flex items-center space-x-1.5 text-neutral-900 font-extrabold">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Est. Total: {formatCurrency(Number(budget_summary.estimated_total))}</span>
              </div>
            )}
          </div>
        </div>

        {/* Budget Summary Card */}
        {budget_summary && (
          <div className="bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-neutral-100 pb-3">
              <PieChart className="w-5 h-5 text-primary-600" />
              <h3 className="text-base font-bold text-neutral-900">Estimated Trip Budget Breakdown</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-neutral-50 p-3.5 rounded-xl space-y-1">
                <span className="text-neutral-500 font-semibold">Estimated Total</span>
                <p className="text-base font-extrabold text-neutral-900">
                  {formatCurrency(Number(budget_summary.estimated_total))}
                </p>
              </div>
              <div className="bg-neutral-50 p-3.5 rounded-xl space-y-1">
                <span className="text-neutral-500 font-semibold">Avg Daily Cost</span>
                <p className="text-base font-extrabold text-neutral-900">
                  {formatCurrency(Number(budget_summary.average_daily_cost))}/day
                </p>
              </div>
              <div className="bg-neutral-50 p-3.5 rounded-xl space-y-1">
                <span className="text-neutral-500 font-semibold">Accommodation</span>
                <p className="text-base font-extrabold text-neutral-900">
                  {formatCurrency(Number(budget_summary.categories.accommodation || 0))}
                </p>
              </div>
              <div className="bg-neutral-50 p-3.5 rounded-xl space-y-1">
                <span className="text-neutral-500 font-semibold">Activities</span>
                <p className="text-base font-extrabold text-neutral-900">
                  {formatCurrency(Number(budget_summary.categories.activities || 0))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Read-Only Itinerary Timeline */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-neutral-900">Destination Stops & Daily Itinerary</h2>
          </div>

          {stops.length === 0 ? (
            <p className="text-xs text-neutral-500 py-4">No destination stops added to this trip yet.</p>
          ) : (
            <div className="space-y-6">
              {stops.map((stop) => (
                <div key={stop.id} className="bg-surface rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
                  {/* City Header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-neutral-900">{stop.city.name}</h3>
                        <p className="text-xs text-neutral-500">{stop.city.country} • {formatDate(stop.start_date)} – {formatDate(stop.end_date)}</p>
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-neutral-600 bg-neutral-50 border border-neutral-200 px-3 py-1 rounded-lg">
                      Lodging: {formatCurrency(Number(stop.accommodation_cost))}
                    </div>
                  </div>

                  {/* Activities List */}
                  {stop.activities.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-2">No activities scheduled for this city stop.</p>
                  ) : (
                    <div className="space-y-3">
                      {stop.activities.map((act) => (
                        <div key={act.id} className="bg-neutral-50/70 border border-neutral-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start space-x-3">
                            <span className="bg-surface border border-neutral-200 px-2 py-0.5 rounded text-xs font-bold text-neutral-800 shrink-0">
                              {act.start_time || 'Flexible'}
                            </span>
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-bold text-neutral-900">{act.activity.name}</h4>
                                <StatusBadge status={act.activity.category} />
                              </div>
                              <p className="text-xs text-neutral-500">{formatDate(act.activity_date)} • {act.activity.duration_minutes} mins</p>
                              {act.notes && <p className="text-xs text-neutral-600">{act.notes}</p>}
                            </div>
                          </div>

                          {Number(act.estimated_cost || 0) > 0 && (
                            <span className="text-xs font-bold text-neutral-900">
                              {formatCurrency(Number(act.estimated_cost))}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
