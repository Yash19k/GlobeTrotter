import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Edit3, Trash2, ArrowRight } from 'lucide-react';
import type { Trip } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface TripCardProps {
  trip: Trip;
  onDelete?: (trip: Trip) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onDelete }) => {
  const coverImage =
    trip.cover_image ||
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-surface rounded-2xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Cover Image Header */}
      <div className="relative h-44 w-full bg-neutral-100 overflow-hidden">
        <img
          src={coverImage}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 via-transparent to-transparent" />
        <div className="absolute top-3 right-3">
          <StatusBadge status={trip.status} className="shadow-xs" />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white drop-shadow-sm line-clamp-1">
            {trip.name}
          </h3>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {trip.description && (
          <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">
            {trip.description}
          </p>
        )}

        <div className="space-y-2 text-xs text-neutral-600 pt-1">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>
              {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>{trip.destination_count || 0} destinations</span>
            </div>

            <div className="flex items-center space-x-1 font-semibold text-neutral-900">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{formatCurrency(Number(trip.total_budget))}</span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="border-t border-neutral-100 pt-3 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Link
              to={`/trips/${trip.id}/edit`}
              className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Edit trip"
            >
              <Edit3 className="w-4 h-4" />
            </Link>

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(trip)}
                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Delete trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <Link
            to={`/trips/${trip.id}`}
            className="inline-flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700 group-hover:translate-x-0.5 transition-transform"
          >
            <span>View Trip</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};
