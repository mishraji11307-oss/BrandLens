import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'success' | 'info' | 'neutral' | 'brand';
  size?: 'sm' | 'md';
  dot?: boolean;
  dotPulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  dotPulse = false,
}) => {
  const hasDot = dot || dotPulse;
  const variantStyles = {
    critical: 'bg-red-50/90 text-red-700 border-red-200/80 shadow-2xs',
    high: 'bg-orange-50/90 text-orange-700 border-orange-200/80 shadow-2xs',
    medium: 'bg-amber-50/90 text-amber-700 border-amber-200/80 shadow-2xs',
    low: 'bg-blue-50/90 text-blue-700 border-blue-200/80 shadow-2xs',
    success: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 shadow-2xs',
    info: 'bg-indigo-50/90 text-indigo-700 border-indigo-200/80 shadow-2xs',
    brand: 'bg-violet-50/90 text-violet-700 border-violet-200/80 shadow-2xs',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200/70',
  };

  const dotColors = {
    critical: 'bg-red-500 ring-red-200',
    high: 'bg-orange-500 ring-orange-200',
    medium: 'bg-amber-500 ring-amber-200',
    low: 'bg-blue-500 ring-blue-200',
    success: 'bg-emerald-500 ring-emerald-200',
    info: 'bg-indigo-500 ring-indigo-200',
    brand: 'bg-violet-500 ring-violet-200',
    neutral: 'bg-slate-400 ring-slate-200',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-bold rounded-full border',
    md: 'text-xs px-2.5 py-1 font-bold rounded-full border',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 uppercase tracking-wider backdrop-blur-2xs transition-colors ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {hasDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ring-2 ${dotColors[variant]} animate-pulse`}
        />
      )}
      {children}
    </span>
  );
};
