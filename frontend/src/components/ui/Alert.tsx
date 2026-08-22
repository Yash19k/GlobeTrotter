import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'error',
  title,
  message,
  className = '',
}) => {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800 icon-red',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 icon-emerald',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 icon-amber',
    info: 'bg-sky-50 border-sky-200 text-sky-800 icon-sky',
  };

  const icons = {
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
  };

  return (
    <div
      className={`flex gap-3 p-3.5 rounded-lg border text-sm ${styles[type]} ${className}`}
      role="alert"
    >
      {icons[type]}
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p className="leading-relaxed">{message}</p>
      </div>
    </div>
  );
};
