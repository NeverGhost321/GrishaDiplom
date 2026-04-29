import type { ReactNode } from 'react';

interface AlertProps {
  title?: string;
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
}

const variantClasses: Record<NonNullable<AlertProps['variant']>, string> = {
  success: 'border-green-500/40 bg-green-500/10 text-green-200',
  warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200',
  danger: 'border-red-500/40 bg-red-500/10 text-red-200',
  info: 'border-blue-500/40 bg-blue-500/10 text-blue-200'
};

export function Alert({ title, children, variant = 'info' }: AlertProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${variantClasses[variant]}`}>
      {title ? <h4 className="mb-1 font-semibold">{title}</h4> : null}
      <div className="text-sm">{children}</div>
    </div>
  );
}
