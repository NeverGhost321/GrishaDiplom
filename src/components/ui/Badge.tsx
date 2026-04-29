import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  success: 'bg-green-500/20 text-green-300',
  warning: 'bg-yellow-500/20 text-yellow-300',
  danger: 'bg-red-500/20 text-red-300',
  info: 'bg-blue-500/20 text-blue-300',
  neutral: 'bg-slate-700 text-slate-200'
};

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
