import React from 'react';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

interface AlertBannerProps {
  type?: 'warning' | 'info' | 'success' | 'error';
  title?: string;
  message: string;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  title,
  message,
  className = ''
}) => {
  const styles = {
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
      titleColor: 'text-amber-900'
    },
    info: {
      container: 'bg-sky-50 border-sky-200 text-sky-900',
      icon: <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />,
      titleColor: 'text-sky-900'
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
      titleColor: 'text-emerald-900'
    },
    error: {
      container: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
      titleColor: 'text-rose-900'
    }
  }[type];

  return (
    <div
      className={`p-4 border rounded-xl flex items-start space-x-3 text-sm leading-relaxed ${styles.container} ${className}`}
    >
      {styles.icon}
      <div className="flex-1">
        {title && <h4 className={`font-semibold mb-0.5 ${styles.titleColor}`}>{title}</h4>}
        <p className="text-xs sm:text-sm opacity-95">{message}</p>
      </div>
    </div>
  );
};
