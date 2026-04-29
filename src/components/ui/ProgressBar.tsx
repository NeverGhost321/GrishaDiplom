interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  helperText?: string;
  variant?: 'success' | 'warning' | 'danger' | 'info';
}

const variantClasses: Record<NonNullable<ProgressBarProps['variant']>, string> = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500'
};

export function ProgressBar({
  value,
  max = 100,
  label,
  helperText,
  variant = 'info'
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-1">
      {label ? <div className="text-sm text-slate-200">{label}</div> : null}
      <div className="h-2.5 w-full rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${variantClasses[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {helperText ? <div className="text-xs text-slate-400">{helperText}</div> : null}
    </div>
  );
}
