import React from 'react';
import type { TripStatus } from '@/types';

interface StatusBadgeProps {
  status: TripStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = (status || '').toUpperCase();

  const styles: Record<string, string> = {
    UPCOMING: 'bg-sky-50 text-sky-700 border-sky-200',
    ONGOING: 'bg-teal-50 text-teal-700 border-teal-200 font-semibold',
    COMPLETED: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  };

  const labels: Record<string, string> = {
    UPCOMING: 'Upcoming',
    ONGOING: 'Ongoing',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  const badgeStyle = styles[normalized] || 'bg-neutral-100 text-neutral-600 border-neutral-200';
  const label = labels[normalized] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0 opacity-75" />
      {label}
    </span>
  );
};
