import { Badge } from './Badge';

interface ComponentSpec {
  label: string;
  value: string | number | boolean | null | undefined;
}

interface ComponentCardProps {
  title: string;
  subtitle?: string;
  price?: number;
  specs?: ComponentSpec[];
  badge?: string;
  className?: string;
}

const formatPrice = (price?: number) =>
  typeof price === 'number' ? `${price.toLocaleString('ru-RU')} ₽` : 'Цена не указана';

export function ComponentCard({
  title,
  subtitle,
  price,
  specs = [],
  badge,
  className = ''
}: ComponentCardProps) {
  return (
    <article className={`rounded-xl border border-slate-800 bg-slate-900 p-4 ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          {subtitle ? <p className="text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        {badge ? <Badge variant="info">{badge}</Badge> : null}
      </div>
      <p className="mb-3 text-sm font-medium text-green-300">{formatPrice(price)}</p>
      {specs.length > 0 ? (
        <ul className="space-y-1 text-sm text-slate-300">
          {specs.map((spec) => (
            <li key={spec.label} className="flex justify-between gap-4 border-b border-slate-800 py-1 last:border-none">
              <span className="text-slate-400">{spec.label}</span>
              <span className="text-right">{String(spec.value ?? '—')}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
