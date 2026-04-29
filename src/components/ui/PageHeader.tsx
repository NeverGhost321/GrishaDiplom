import type { ReactNode } from 'react';

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        {description ? <p className="max-w-3xl text-sm text-slate-600 sm:text-base">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}
