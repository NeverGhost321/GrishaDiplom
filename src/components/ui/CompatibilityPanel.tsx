import type { CompatibilityResult } from '@/src/types/compatibility';
import { Alert } from './Alert';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';

interface CompatibilityPanelProps {
  result: CompatibilityResult | null;
  loading?: boolean;
}

export function CompatibilityPanel({ result, loading = false }: CompatibilityPanelProps) {
  if (loading) {
    return <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-300">Проверяем совместимость...</div>;
  }

  if (!result) {
    return <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">Выберите комплектующие для проверки совместимости.</div>;
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Результат совместимости</h3>
        <Badge variant={result.isCompatible ? 'success' : 'danger'}>
          {result.isCompatible ? 'Совместимо' : 'Есть проблемы'}
        </Badge>
      </div>
      <ProgressBar
        value={result.compatibilityScore}
        max={100}
        label={`Оценка совместимости: ${result.compatibilityScore}/100`}
        variant={result.compatibilityScore >= 80 ? 'success' : result.compatibilityScore >= 50 ? 'warning' : 'danger'}
      />
      <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
        <p>Потребление: {result.totalPowerConsumption} Вт</p>
        <p>Рекомендуемый БП: {result.requiredPsuWattage} Вт</p>
        <p>Общая стоимость: {result.totalPrice.toLocaleString('ru-RU')} ₽</p>
      </div>
      {result.errors.length > 0 && <Alert variant="danger" title="Ошибки">{result.errors.join(' • ')}</Alert>}
      {result.warnings.length > 0 && <Alert variant="warning" title="Предупреждения">{result.warnings.join(' • ')}</Alert>}
      {result.recommendations.length > 0 && <Alert variant="info" title="Рекомендации">{result.recommendations.join(' • ')}</Alert>}
    </section>
  );
}
