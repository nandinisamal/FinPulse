import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: string; // Bootstrap icon class, e.g. 'bi-wallet2'
  trend?: {
    positive: boolean;
    text: string;
  };
  accentColor?: 'navy' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
  accentColor = 'navy',
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          indicator: 'text-emerald-600',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
          indicator: 'text-amber-600',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
          indicator: 'text-rose-600',
        };
      case 'indigo':
        return {
          iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
          indicator: 'text-indigo-600',
        };
      case 'navy':
      default:
        return {
          iconBg: 'bg-slate-100 text-slate-800 border-slate-200',
          indicator: 'text-slate-600',
        };
    }
  };

  const accent = getAccentStyles();

  return (
    <div className="fin-card p-4 h-full flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            {title}
          </span>
          <div className="text-2xl font-bold font-numeric text-slate-900 mt-1.5">
            {value}
          </div>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${accent.iconBg}`}>
          <i className={`bi ${icon} text-lg`}></i>
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtext}</span>
          {trend && (
            <span className={`font-medium flex items-center gap-1 ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              <i className={`bi ${trend.positive ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}`}></i>
              {trend.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
