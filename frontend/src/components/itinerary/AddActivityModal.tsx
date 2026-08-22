import React, { useState } from 'react';
import { X, Search, Calendar, Clock, DollarSign, ArrowLeft, Plus, Tag } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useActivities } from '@/hooks/useActivities';
import { useDebounce } from '@/hooks/useDebounce';
import type { Activity, TripStop } from '@/types';
import type { AddActivityPayload } from '@/services/itineraryService';
import { formatCurrency } from '@/lib/utils';

interface AddActivityModalProps {
  isOpen: boolean;
  stop: TripStop;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: AddActivityPayload) => Promise<void>;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  stop,
  isSubmitting = false,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState<'select-activity' | 'configure-activity'>('select-activity');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [searchRaw, setSearchRaw] = useState('');
  const debouncedSearch = useDebounce(searchRaw, 300);

  const [activityDate, setActivityDate] = useState(stop.start_date);
  const [startTime, setStartTime] = useState('09:00');
  const [estimatedCost, setEstimatedCost] = useState('0');
  const [notes, setNotes] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  // Automatically filter activities for this stop's city
  const { data: activityData, isLoading: isActivitiesLoading } = useActivities({
    city: stop.city.id,
    search: debouncedSearch,
    page_size: 8,
  });

  if (!isOpen) return null;

  const handleActivitySelect = (act: Activity) => {
    setSelectedActivity(act);
    setEstimatedCost(String(act.estimated_cost || 0));
    setStep('configure-activity');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;
    setApiError(null);

    try {
      await onSubmit({
        activity_id: selectedActivity.id,
        activity_date: activityDate,
        start_time: startTime || undefined,
        estimated_cost: Number(estimatedCost) || 0,
        notes,
      });

      // Reset
      setStep('select-activity');
      setSelectedActivity(null);
      setSearchRaw('');
      onClose();
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object' && !Array.isArray(errorData)) {
          const firstKey = Object.keys(errorData)[0];
          const firstVal = errorData[firstKey];
          setApiError(`${firstKey}: ${Array.isArray(firstVal) ? firstVal[0] : firstVal}`);
        } else {
          setApiError('Failed to schedule activity. Check dates and try again.');
        }
      } else {
        setApiError('Network error. Unable to schedule activity.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl border border-neutral-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center space-x-2">
            {step === 'configure-activity' && (
              <button
                type="button"
                onClick={() => setStep('select-activity')}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {step === 'select-activity'
                  ? `Add Activity in ${stop.city.name}`
                  : `Schedule: ${selectedActivity?.name}`}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {apiError && <Alert type="error" message={apiError} />}

          {step === 'select-activity' ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder={`Search activities in ${stop.city.name}...`}
                  value={searchRaw}
                  onChange={(e) => setSearchRaw(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              {isActivitiesLoading ? (
                <div className="py-8 text-center text-xs text-neutral-500">Loading city activities...</div>
              ) : (activityData?.results || []).length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">No activities cataloged for {stop.city.name}.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {activityData?.results.map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => handleActivitySelect(act)}
                      className="flex items-start space-x-3 p-3 rounded-xl border border-neutral-200 bg-surface hover:border-primary-500 hover:bg-primary-50/40 text-left transition-all group cursor-pointer"
                    >
                      <img
                        src={
                          act.image ||
                          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={act.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-neutral-900 truncate group-hover:text-primary-700">
                          {act.name}
                        </p>
                        <p className="text-[11px] text-neutral-500 flex items-center mt-0.5">
                          <Tag className="w-3 h-3 mr-1 text-neutral-400 shrink-0" />
                          {act.category} • {formatCurrency(Number(act.estimated_cost || 0))}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-3.5 flex items-center space-x-3">
                <img
                  src={selectedActivity?.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=200&q=80'}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{selectedActivity?.name}</h4>
                  <p className="text-xs text-neutral-500">
                    {selectedActivity?.category} • {selectedActivity?.duration_minutes} mins duration
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Activity Date *"
                  type="date"
                  min={stop.start_date}
                  max={stop.end_date}
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Start Time (optional)"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  leftIcon={<Clock className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Estimated Cost ($ USD)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                leftIcon={<DollarSign className="w-4 h-4" />}
              />

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bring tickets PDF on phone, meet guide at North entrance"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-surface px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-neutral-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setStep('select-activity')}>
                  Change Activity
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting} leftIcon={<Plus className="w-4 h-4" />}>
                  Add to Itinerary
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
