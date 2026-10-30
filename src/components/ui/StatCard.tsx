import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: 'navy' | 'teal' | 'amber' | 'emerald' | 'violet';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'violet',
}) => {
  const iconColorMap = {
    navy: 'bg-[#211A2D] text-violet-300 border-[#30263E]',
    violet: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    teal: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    amber: 'bg-[#FBBF74]/15 text-[#FBBF74] border-[#FBBF74]/30',
    emerald: 'bg-[#4ADEA8]/15 text-[#4ADEA8] border-[#4ADEA8]/30',
  };

  return (
    <div className="bg-[#191521] rounded-2xl border border-[#30263E] p-5 sm:p-6 shadow-card-dark hover:border-violet-500/40 hover:shadow-glow-violet-sm transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#AAA2B8] uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border transition-transform duration-200 group-hover:scale-105 ${iconColorMap[color]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-[#F5F3FA] tracking-tight">{value}</span>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trend.isPositive ? 'text-[#4ADEA8]' : 'text-[#AAA2B8]'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-[#777084] mt-1.5 leading-relaxed">{subtitle}</p>}
    </div>
  );
};
