import type { ReactNode } from 'react';
import { Card } from './Card';

export function EmptyState({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <Card><div className="space-y-3 py-6 text-center"><h3 className="text-lg font-semibold text-slate-900">{title}</h3><p className="text-sm text-slate-600">{description}</p><div className="flex justify-center gap-2">{actions}</div></div></Card>;
}
