import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function Card({ children, title, description, className = '' }: CardProps) {
  return (
    <section className={`rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm ${className}`}>
      {title ? <h3 className="text-lg font-semibold text-slate-100">{title}</h3> : null}
      {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      <div className={title || description ? 'mt-4' : ''}>{children}</div>
    </section>
  );
}
