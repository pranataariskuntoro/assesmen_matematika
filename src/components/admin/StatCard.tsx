import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../ui/Button';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, description, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300/60 hover:-translate-y-0.5 transition-all duration-300 group",
      className
    )}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 group-hover:bg-brand-100 group-hover:scale-105 transition-all duration-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <h2 className="text-3xl font-display font-extrabold tracking-tight text-slate-800">{value}</h2>
        {trend && (
          <span
            className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full",
              trend.isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-750"
            )}
          >
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {description && (
        <p className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-1">{description}</p>
      )}
    </div>
  );
}
