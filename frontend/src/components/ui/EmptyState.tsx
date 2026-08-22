import React from 'react';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Compass,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`py-12 px-6 text-center space-y-4 bg-surface rounded-2xl border border-neutral-200 shadow-xs ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto shadow-xs border border-neutral-200/60">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-base font-bold text-neutral-900">{title}</h3>
        <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
