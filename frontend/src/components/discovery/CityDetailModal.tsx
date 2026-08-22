import React from 'react';
import { X, MapPin, Star, Compass, Tag } from 'lucide-react';
import type { City } from '@/types';
import { Button } from '@/components/ui/Button';
import { useActivities } from '@/hooks/useActivities';

interface CityDetailModalProps {
  city: City | null;
  onClose: () => void;
}

export const CityDetailModal: React.FC<CityDetailModalProps> = ({ city, onClose }) => {
  const { data: activityData, isLoading: isActivitiesLoading } = useActivities(
    city ? { city: city.id } : {}
  );

  if (!city) return null;

  const activities = activityData?.results || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl border border-neutral-200 shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cover Image Header */}
        <div className="relative h-64 w-full bg-neutral-900">
          <img
            src={
              city.image ||
              'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'
            }
            alt={city.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-900/60 text-white hover:bg-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-5 left-6 right-6 text-white space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-primary-300">
              <MapPin className="w-4 h-4" />
              <span>{city.region ? `${city.region} • ` : ''}{city.country}</span>
            </div>
            <h2 className="text-3xl font-extrabold">{city.name}</h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Metadata Badges */}
          <div className="flex items-center space-x-6 text-sm border-b border-neutral-100 pb-4">
            <div>
              <span className="text-xs text-neutral-500 block font-medium">Popularity Score</span>
              <span className="font-bold text-neutral-900 flex items-center mt-0.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                {Number(city.popularity_score || 0).toFixed(1)} / 10.0
              </span>
            </div>

            <div>
              <span className="text-xs text-neutral-500 block font-medium">Cost Index</span>
              <span className="font-bold text-emerald-600 mt-0.5 block">
                {'$'.repeat(city.cost_index || 3)} ({city.cost_index}/5)
              </span>
            </div>

            <div>
              <span className="text-xs text-neutral-500 block font-medium">Activities Available</span>
              <span className="font-bold text-neutral-900 mt-0.5 block">
                {city.activity_count || activities.length} activities
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-2">About {city.name}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {city.description || 'No detailed description available for this destination.'}
            </p>
          </div>

          {/* Activities List Preview */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center space-x-2">
              <Compass className="w-4 h-4 text-primary-600" />
              <span>Popular Activities in {city.name}</span>
            </h3>

            {isActivitiesLoading ? (
              <p className="text-xs text-neutral-500">Loading activities...</p>
            ) : activities.length === 0 ? (
              <p className="text-xs text-neutral-500">No specific activities cataloged for this city yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activities.slice(0, 4).map((act) => (
                  <div key={act.id} className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex items-start space-x-3">
                    {act.image && (
                      <img src={act.image} alt={act.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-neutral-900 truncate">{act.name}</p>
                      <p className="text-[11px] text-neutral-500 flex items-center mt-0.5">
                        <Tag className="w-3 h-3 mr-1 text-primary-600" />
                        {act.category} • ${Number(act.estimated_cost).toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 p-4 bg-neutral-50/50 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
