import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  badge
}) {
  const colorStyles = {
    blue: 'border-blue-500/30 text-blue-700 bg-blue-50/60',
    amber: 'border-amber-500/30 text-amber-700 bg-amber-50/60',
    emerald: 'border-emerald-500/30 text-emerald-700 bg-emerald-50/60',
    purple: 'border-purple-500/30 text-purple-700 bg-purple-50/60',
    red: 'border-red-500/30 text-red-700 bg-red-50/60',
    slate: 'border-slate-300 text-slate-700 bg-slate-50'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:shadow transition relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
            {badge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorStyles[color] || colorStyles.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>{trend.label}</span>
          <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-amber-600'}`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
