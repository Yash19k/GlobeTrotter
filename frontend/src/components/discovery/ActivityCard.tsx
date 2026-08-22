import React from 'react';
import { Clock, DollarSign, MapPin, Tag } from 'lucide-react';
import type { Activity } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface ActivityCardProps {
  activity: Activity;
  onSelect: (activity: Activity) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onSelect }) => {
  const imageUrl =
    activity.image ||
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80';

  const categoryLabels: Record<string, string> = {
    SIGHTSEEING: 'Sightseeing',
    FOOD: 'Food & Dining',
    ADVENTURE: 'Adventure',
    CULTURE: 'Culture & History',
    SHOPPING: 'Shopping',
    NIGHTLIFE: 'Nightlife',
    NATURE: 'Nature & Outdoors',
    OTHER: 'Other',
  };

  const categoryBadgeStyle: Record<string, string> = {
    SIGHTSEEING: 'bg-sky-50 text-sky-700 border-sky-200',
    FOOD: 'bg-orange-50 text-orange-700 border-orange-200',
    ADVENTURE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CULTURE: 'bg-purple-50 text-purple-700 border-purple-200',
    SHOPPING: 'bg-pink-50 text-pink-700 border-pink-200',
    NIGHTLIFE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    NATURE: 'bg-teal-50 text-teal-700 border-teal-200',
    OTHER: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  };

  const categoryKey = (activity.category || 'OTHER').toUpperCase();
  const categoryLabel = categoryLabels[categoryKey] || activity.category;
  const badgeClass = categoryBadgeStyle[categoryKey] || categoryBadgeStyle.OTHER;

  return (
    <div className="bg-surface rounded-2xl border border-neutral-200 shadow-xs overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Image Header */}
      <div className="relative h-44 w-full bg-neutral-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={activity.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass} shadow-xs`}>
            <Tag className="w-3 h-3 mr-1" />
            {categoryLabel}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white drop-shadow-sm line-clamp-1">
            {activity.name}
          </h3>
          {activity.city_name && (
            <p className="text-xs text-neutral-200 flex items-center mt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1 text-primary-300 shrink-0" />
              {activity.city_name}{activity.city_country ? `, ${activity.city_country}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {activity.description && (
          <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">
            {activity.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-neutral-600 border-t border-neutral-100 pt-3">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{activity.duration_minutes || 60} mins</span>
          </div>

          <div className="flex items-center font-bold text-neutral-900">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>{formatCurrency(Number(activity.estimated_cost || 0))}</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(activity)}
          className="w-full mt-2"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};
