import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses = {
  primary: 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700',
  secondary: 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50',
  danger: 'bg-red-600 text-white border border-red-600 hover:bg-red-700'
};

const sizeClasses = { sm: 'h-9 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-11 px-5 text-base' };

export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, loading, ...props }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? 'Загрузка...' : children}
    </button>
  );
}
