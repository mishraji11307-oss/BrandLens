import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-500 hover:via-indigo-500 hover:to-violet-500 text-white shadow-card hover:shadow-glow-sm btn-shimmer border border-indigo-400/30',
    glow:
      'bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white shadow-glow-md btn-shimmer border border-indigo-300/40',
    secondary:
      'bg-slate-900 hover:bg-slate-800 text-white shadow-card border border-slate-700/50 hover:border-slate-600',
    outline:
      'bg-white/80 hover:bg-white text-slate-700 hover:text-brand-700 border border-border hover:border-brand-300 shadow-subtle hover:shadow-card backdrop-blur-xs',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-card hover:shadow-glow-critical border border-red-400/30',
    ghost:
      'text-slate-600 hover:text-brand-700 hover:bg-brand-50/70',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-xs font-semibold px-4 py-2 rounded-xl gap-2',
    lg: 'text-sm font-semibold px-5 py-2.5 rounded-xl gap-2.5',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-current" /> : icon}
      {children}
    </button>
  );
};
