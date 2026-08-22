import React from 'react';
import { Clock, DollarSign, Trash2, ArrowUp, ArrowDown, Tag, FileText } from 'lucide-react';
import type { TripActivity } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ActivityItemProps {
  item: TripActivity;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  item,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
}) => {
  const activity = item.activity;
  const categoryKey = (activity.category || 'OTHER').toUpperCase();

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

  const badgeClass = categoryBadgeStyle[categoryKey] || categoryBadgeStyle.OTHER;

  return (
    <div className="bg-surface rounded-2xl border border-neutral-200 p-4 shadow-xs hover:border-neutral-300 transition-all flex items-start space-x-4 group">
      {/* Time Indicator / Image */}
      <div className="flex flex-col items-center shrink-0 w-16 text-center">
        {item.start_time ? (
          <div className="bg-primary-50 border border-primary-200 text-primary-700 font-bold text-xs px-2 py-1 rounded-lg shadow-2xs">
            {item.start_time.slice(0, 5)}
          </div>
        ) : (
          <div className="bg-neutral-100 border border-neutral-200 text-neutral-500 text-[11px] font-semibold px-2 py-1 rounded-lg">
            Anytime
          </div>
        )}
        <span className="text-[11px] text-neutral-500 mt-1 flex items-center">
          <Clock className="w-3 h-3 mr-0.5" />
          {activity.duration_minutes || 60}m
        </span>
      </div>

      {/* Main Content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold text-neutral-900 truncate">
              {activity.name}
            </h4>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
              <Tag className="w-2.5 h-2.5 mr-0.5" />
              {activity.category}
            </span>
          </div>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              disabled={isFirst}
              onClick={onMoveUp}
              className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 cursor-pointer"
              title="Move Activity Up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={onMoveDown}
              className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 cursor-pointer"
              title="Move Activity Down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1 text-neutral-400 hover:text-error-600 cursor-pointer"
              title="Remove Activity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {activity.description && (
          <p className="text-xs text-neutral-600 line-clamp-1">
            {activity.description}
          </p>
        )}

        {item.notes && (
          <p className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-200/80 px-2.5 py-1 rounded-lg flex items-center">
            <FileText className="w-3 h-3 mr-1 text-neutral-400 shrink-0" />
            {item.notes}
          </p>
        )}

        <div className="flex items-center justify-end text-xs font-bold text-emerald-600 pt-0.5">
          <DollarSign className="w-3.5 h-3.5" />
          <span>{formatCurrency(Number(item.estimated_cost || 0))}</span>
        </div>
      </div>
    </div>
  );
};
