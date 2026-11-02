import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  const norm = status.toLowerCase();

  let colorStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  if (norm.includes('critical') || norm.includes('danger') || norm.includes('red') || norm.includes('prohibited')) {
    colorStyle = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (norm.includes('high') || norm.includes('warning') || norm.includes('yellow') || norm.includes('caution') || norm.includes('significant')) {
    colorStyle = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (norm.includes('medium') || norm.includes('moderate')) {
    colorStyle = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (norm.includes('low') || norm.includes('safe') || norm.includes('green') || norm.includes('completed')) {
    colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  const sizeStyle =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1 text-sm'
      : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold tracking-wide capitalize ${sizeStyle} ${colorStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
};
