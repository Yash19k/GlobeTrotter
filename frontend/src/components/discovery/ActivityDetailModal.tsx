import React from 'react';
import { X, MapPin, Clock, DollarSign, Tag } from 'lucide-react';
import type { Activity } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface ActivityDetailModalProps {
  activity: Activity | null;
  onClose: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ activity, onClose }) => {
  if (!activity) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl border border-neutral-200 shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Image Header */}
        <div className="relative h-60 w-full bg-neutral-900">
          <img
            src={
              activity.image ||
              'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'
            }
            alt={activity.name}
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
              <span>{activity.city_name}{activity.city_country ? `, ${activity.city_country}` : ''}</span>
            </div>
            <h2 className="text-2xl font-extrabold">{activity.name}</h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Attributes */}
          <div className="flex items-center justify-between text-sm border-b border-neutral-100 pb-4">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-primary-600 shrink-0" />
              <div>
                <span className="text-xs text-neutral-500 block font-medium">Category</span>
                <span className="font-bold text-neutral-900">{activity.category}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-sky-600 shrink-0" />
              <div>
                <span className="text-xs text-neutral-500 block font-medium">Duration</span>
                <span className="font-bold text-neutral-900">{activity.duration_minutes || 60} mins</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs text-neutral-500 block font-medium">Est. Cost</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(Number(activity.estimated_cost || 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-2">Description</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {activity.description || 'No detailed description provided for this activity.'}
            </p>
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
