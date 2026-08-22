import React, { useState } from 'react';
import { X, Search, Calendar, MapPin, DollarSign, ArrowLeft, Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useCities } from '@/hooks/useCities';
import { useDebounce } from '@/hooks/useDebounce';
import type { City, Trip } from '@/types';
import type { AddStopPayload } from '@/services/itineraryService';

interface AddStopModalProps {
  isOpen: boolean;
  trip: Trip;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: AddStopPayload) => Promise<void>;
}

export const AddStopModal: React.FC<AddStopModalProps> = ({
  isOpen,
  trip,
  isSubmitting = false,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState<'select-city' | 'configure-dates'>('select-city');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [searchRaw, setSearchRaw] = useState('');
  const debouncedSearch = useDebounce(searchRaw, 300);

  const [startDate, setStartDate] = useState(trip.start_date);
  const [endDate, setEndDate] = useState(trip.start_date);
  const [transportCost, setTransportCost] = useState('0');
  const [accommodationCost, setAccommodationCost] = useState('0');
  const [notes, setNotes] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: cityData, isLoading: isCitiesLoading } = useCities({
    search: debouncedSearch,
    page_size: 6,
  });

  if (!isOpen) return null;

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setStep('configure-dates');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) return;
    setApiError(null);

    try {
      await onSubmit({
        city_id: selectedCity.id,
        start_date: startDate,
        end_date: endDate,
        transport_cost: Number(transportCost) || 0,
        accommodation_cost: Number(accommodationCost) || 0,
        notes,
      });

      // Reset
      setStep('select-city');
      setSelectedCity(null);
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
          setApiError('Failed to add stop. Please check dates and try again.');
        }
      } else {
        setApiError('Network error. Unable to add stop.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl border border-neutral-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center space-x-2">
            {step === 'configure-dates' && (
              <button
                type="button"
                onClick={() => setStep('select-city')}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-lg font-bold text-neutral-900">
              {step === 'select-city' ? 'Select Destination City' : `Configure Stop: ${selectedCity?.name}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {apiError && <Alert type="error" message={apiError} />}

          {step === 'select-city' ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search city by name or country..."
                  value={searchRaw}
                  onChange={(e) => setSearchRaw(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              {isCitiesLoading ? (
                <div className="py-8 text-center text-xs text-neutral-500">Loading cities...</div>
              ) : (cityData?.results || []).length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">No cities found matching search.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {cityData?.results.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className="flex items-center space-x-3 p-3 rounded-xl border border-neutral-200 bg-surface hover:border-primary-500 hover:bg-primary-50/40 text-left transition-all group cursor-pointer"
                    >
                      <img
                        src={
                          city.image ||
                          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={city.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-neutral-900 truncate group-hover:text-primary-700">
                          {city.name}
                        </p>
                        <p className="text-[11px] text-neutral-500 flex items-center mt-0.5">
                          <MapPin className="w-3 h-3 mr-1 text-neutral-400 shrink-0" />
                          {city.country}
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
                  src={selectedCity?.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=200&q=80'}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{selectedCity?.name}, {selectedCity?.country}</h4>
                  <p className="text-xs text-neutral-500">Trip bounds: {trip.start_date} to {trip.end_date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Stop Start Date *"
                  type="date"
                  min={trip.start_date}
                  max={trip.end_date}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Stop End Date *"
                  type="date"
                  min={startDate || trip.start_date}
                  max={trip.end_date}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Transport Cost ($)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={transportCost}
                  onChange={(e) => setTransportCost(e.target.value)}
                  leftIcon={<DollarSign className="w-4 h-4" />}
                />
                <Input
                  label="Lodging Cost ($)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={accommodationCost}
                  onChange={(e) => setAccommodationCost(e.target.value)}
                  leftIcon={<DollarSign className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Notes / Reminders</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Flight arrives at 10 AM, booked Hotel Lumiere"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-surface px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-neutral-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setStep('select-city')}>
                  Change City
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting} leftIcon={<Plus className="w-4 h-4" />}>
                  Add Stop to Trip
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
