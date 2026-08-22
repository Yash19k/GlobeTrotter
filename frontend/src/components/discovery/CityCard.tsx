import React from 'react';
import { MapPin, Star, Compass } from 'lucide-react';
import type { City } from '@/types';
import { Button } from '@/components/ui/Button';

interface CityCardProps {
  city: City;
  onSelect: (city: City) => void;
}

export const CityCard: React.FC<CityCardProps> = ({ city, onSelect }) => {
  const imageUrl =
    city.image ||
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80';

  const renderCostIndex = (index: number) => {
    const activeCount = Math.min(Math.max(index, 1), 5);
    return (
      <span className="inline-flex items-center text-xs font-semibold text-neutral-600" title={`Cost Index: ${index}/5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < activeCount ? 'text-emerald-600 font-bold' : 'text-neutral-300'}>
            $
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="bg-surface rounded-2xl border border-neutral-200 shadow-xs overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Cover Image Header */}
      <div className="relative h-48 w-full bg-neutral-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent" />

        {/* Popularity badge */}
        {city.popularity_score !== undefined && (
          <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-xs border border-neutral-200 px-2.5 py-1 rounded-full text-xs font-bold text-neutral-800 shadow-xs flex items-center space-x-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{Number(city.popularity_score).toFixed(1)}</span>
          </div>
        )}

        {/* Region tag */}
        {city.region && (
          <div className="absolute top-3 left-3 bg-neutral-900/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-medium text-white shadow-xs">
            {city.region}
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-extrabold text-white drop-shadow-sm">
            {city.name}
          </h3>
          <p className="text-xs font-medium text-neutral-200 flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-primary-300 shrink-0" />
            {city.country}
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {city.description && (
          <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">
            {city.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs border-t border-neutral-100 pt-3">
          <div className="flex items-center space-x-1">
            <span className="text-neutral-400 font-medium">Cost:</span>
            {renderCostIndex(city.cost_index)}
          </div>

          {city.activity_count !== undefined && (
            <div className="flex items-center space-x-1 text-neutral-500">
              <Compass className="w-3.5 h-3.5 text-neutral-400" />
              <span>{city.activity_count} activities</span>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(city)}
          className="w-full mt-2"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};
