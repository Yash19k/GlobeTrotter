import React from 'react';
import { MapPin, Calendar, Trash2, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import type { TripStop } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

interface StopCardProps {
  stop: TripStop;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export const StopCard: React.FC<StopCardProps> = ({
  stop,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
}) => {
  const imageUrl =
    stop.city.image ||
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80';

  const transport = Number(stop.transport_cost || 0);
  const lodging = Number(stop.accommodation_cost || 0);
  const activitiesTotal = (stop.activities || []).reduce(
    (acc, act) => acc + Number(act.estimated_cost || 0),
    0
  );
  const stopTotal = transport + lodging + activitiesTotal;

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl border p-4 transition-all duration-150 cursor-pointer overflow-hidden ${
        isSelected
          ? 'bg-surface border-primary-500 shadow-md ring-2 ring-primary-500/20'
          : 'bg-surface border-neutral-200 shadow-xs hover:border-neutral-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* City Image */}
        <div className="relative w-14 h-14 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
          <img src={imageUrl} alt={stop.city.name} className="w-full h-full object-cover" />
          <div className="absolute top-1 left-1 bg-neutral-900/70 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            #{stop.stop_order}
          </div>
        </div>

        {/* Content Details */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900 truncate flex items-center">
              {stop.city.name}
            </h3>

            <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                disabled={isFirst}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp();
                }}
                className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 cursor-pointer"
                title="Move Stop Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={isLast}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown();
                }}
                className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 cursor-pointer"
                title="Move Stop Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 text-neutral-400 hover:text-error-600 cursor-pointer"
                title="Delete Stop"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-xs text-neutral-500 flex items-center">
            <MapPin className="w-3 h-3 mr-1 text-neutral-400 shrink-0" />
            {stop.city.country}
          </p>

          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-neutral-100 text-neutral-600">
            <span className="flex items-center font-medium">
              <Calendar className="w-3 h-3 mr-1 text-primary-600 shrink-0" />
              {formatDate(stop.start_date)} – {formatDate(stop.end_date)}
            </span>

            <span className="font-bold text-neutral-900">
              {formatCurrency(stopTotal)}
            </span>
          </div>
        </div>

        <ChevronRight className={`w-5 h-5 text-neutral-400 self-center shrink-0 transition-transform ${isSelected ? 'text-primary-600 translate-x-0.5' : ''}`} />
      </div>
    </div>
  );
};
