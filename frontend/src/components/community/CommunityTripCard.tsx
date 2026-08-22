import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, User, Copy } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useCopyTrip } from '@/hooks/usePublicSharing';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { CommunityTripCard as CommunityTripCardType } from '@/types';

interface CommunityTripCardProps {
  trip: CommunityTripCardType;
}

export const CommunityTripCard: React.FC<CommunityTripCardProps> = ({ trip }) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const copyMutation = useCopyTrip();

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const newTrip = await copyMutation.mutateAsync(trip.share_slug);
      navigate(`/trips/${newTrip.id}`);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to copy trip.');
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-6 space-y-4">
        {/* Header Info */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
            <span className="flex items-center">
              <User className="w-3.5 h-3.5 mr-1 text-primary-600" />
              {trip.creator}
            </span>
            <span>{trip.duration_days} Days</span>
          </div>

          <h3 className="text-lg font-extrabold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {trip.name}
          </h3>

          {trip.description && (
            <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
              {trip.description}
            </p>
          )}
        </div>

        {/* Cities Badge List */}
        {trip.cities && trip.cities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {trip.cities.map((city) => (
              <span
                key={city.id}
                className="inline-flex items-center text-[11px] font-semibold text-neutral-700 bg-neutral-100 border border-neutral-200/70 px-2.5 py-0.5 rounded-full"
              >
                <MapPin className="w-3 h-3 mr-1 text-neutral-400" />
                {city.name}
              </span>
            ))}
          </div>
        )}

        {/* Dates & Cost Footer */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
          <span className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-neutral-400" />
            {formatDate(trip.start_date)}
          </span>

          <span className="font-extrabold text-neutral-900">
            {formatCurrency(Number(trip.estimated_cost))}
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-6 pb-6 pt-0 flex items-center space-x-2">
        <Link to={`/public/trips/${trip.share_slug}`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full">
            View Itinerary →
          </Button>
        </Link>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleCopy}
          isLoading={copyMutation.isPending}
          title="Copy to My Account"
          leftIcon={<Copy className="w-3.5 h-3.5" />}
        >
          Copy
        </Button>
      </div>
    </div>
  );
};
