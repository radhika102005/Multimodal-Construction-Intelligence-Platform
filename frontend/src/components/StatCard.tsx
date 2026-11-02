import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  changePct?: number;
  trend?: 'up' | 'down' | 'neutral';
  period?: string;
  icon: LucideIcon;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  changePct,
  trend = 'neutral',
  period,
  icon: Icon,
  accentColor = 'text-construction-500 bg-construction-50'
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${accentColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-navy-900 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>

        {changePct !== undefined && (
          <div className="flex items-center text-xs font-medium">
            {trend === 'up' && (
              <span className="flex items-center text-emerald-600 font-semibold">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{changePct}%
              </span>
            )}
            {trend === 'down' && (
              <span className="flex items-center text-rose-600 font-semibold">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                -{changePct}%
              </span>
            )}
            {trend === 'neutral' && (
              <span className="flex items-center text-slate-500">
                <Minus className="w-3.5 h-3.5 mr-0.5" />
                {changePct}%
              </span>
            )}
            {period && <span className="text-slate-400 ml-1 font-normal">{period}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
