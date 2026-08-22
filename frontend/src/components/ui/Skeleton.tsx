import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-neutral-200/70 rounded-lg ${className}`} />
);

export const TripCardSkeleton: React.FC = () => (
  <div className="bg-surface rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <Skeleton className="h-4 w-3/4" />
    <div className="flex items-center space-x-4 pt-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="border-t border-neutral-100 pt-3 flex justify-between items-center">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  </div>
);
