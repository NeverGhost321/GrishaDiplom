'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert } from '@/src/components/ui/Alert';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { CompatibilityPanel } from '@/src/components/ui/CompatibilityPanel';
import type { CompatibilityResult } from '@/src/types/compatibility';
import type { SavedBuild } from '@/src/types/build';

type BuildDetailsApiResponse = { item?: SavedBuild; compatibilityResult?: CompatibilityResult; error?: string };
const formatPrice = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;
const formatDate = (value: string) => new Date(value).toLocaleString('ru-RU');

export default function BuildDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [build, setBuild] = useState<SavedBuild | null>(null);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadBuild() {
      setLoading(true);
      try {
        const response = await fetch(`/api/builds/${params.id}`);
        const data = (await response.json()) as BuildDetailsApiResponse;
        if (response.status === 404) return setNotFound(true);
        if (!response.ok || !data.item) return setError(data.error || 'Не удалось загрузить сборку.');
        setBuild(data.item);
        setCompatibilityResult(data.compatibilityResult ?? null);
      } catch {
        setError('Ошибка сети при загрузке сборки.');
      } finally {
        setLoading(false);
      }
    }
    void loadBuild();
  }, [params.id]);

  const powerReservePercent = useMemo(() => {
    if (!build || !compatibilityResult) return null;
    return ((build.psu.wattage - compatibilityResult.totalPowerConsumption) / build.psu.wattage) * 100;
  }, [build, compatibilityResult]);

  async function onDeleteBuild() {
    if (!build || !window.confirm(`Удалить сборку «${build.name}»?`)) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/builds/${build.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      router.push('/saved-builds');
    } catch {
      setError('Не удалось удалить сборку.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-300">Загружаем детали сборки...</div>;
  if (notFound) return <Alert variant="warning" title="Сборка не найдена">Сборка с ID {params.id} отсутствует.</Alert>;
  if (error || !build) return <Alert variant="danger" title="Ошибка загрузки">{error || 'Пустые данные сборки.'}</Alert>;

  return (
    <section className="space-y-6">
      <Card title={build.name} description={`Создано: ${formatDate(build.createdAt)}`}>
        <div className="grid gap-2 text-sm text-slate-200 sm:grid-cols-3">
          <p>Бюджет: <span className="font-semibold text-slate-100">{formatPrice(build.budget)}</span></p>
          <p>Итоговая цена: <span className="font-semibold text-slate-100">{formatPrice(build.totalPrice)}</span></p>
          <p>ID: <span className="font-semibold text-slate-100">{build.id}</span></p>
        </div>
      </Card>
      <CompatibilityPanel result={compatibilityResult} />
      <Card title="Энергопотребление">
        {compatibilityResult ? <div className="space-y-2 text-sm text-slate-200"><p>Потребление: {compatibilityResult.totalPowerConsumption} Вт</p><p>Мощность БП: {build.psu.wattage} Вт</p><p>Запас: {powerReservePercent?.toFixed(1)}%</p>{typeof powerReservePercent === 'number' && powerReservePercent < 20 ? <Alert variant="warning" title="Низкий запас">Запас мощности менее 20%.</Alert> : null}</div> : <p className="text-slate-400">Нет данных.</p>}
      </Card>
      <Card title="Комплектующие">
        <ul className="grid gap-2 text-sm text-slate-300 md:grid-cols-2">
          <li>CPU: {build.cpu.brand} {build.cpu.name} — {formatPrice(build.cpu.price)}</li><li>Motherboard: {build.motherboard.name} — {formatPrice(build.motherboard.price)}</li><li>RAM: {build.ram.name} — {formatPrice(build.ram.price)}</li><li>GPU: {build.gpu.brand} {build.gpu.name} — {formatPrice(build.gpu.price)}</li><li>Storage: {build.storage.name} — {formatPrice(build.storage.price)}</li><li>PSU: {build.psu.name} — {formatPrice(build.psu.price)}</li><li>Case: {build.pcCase.name} — {formatPrice(build.pcCase.price)}</li>{build.cooler ? <li>Cooler: {build.cooler.name} — {formatPrice(build.cooler.price)}</li> : <li>Cooler: отсутствует</li>}
        </ul>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button variant="danger" onClick={onDeleteBuild} disabled={deleting}>{deleting ? 'Удаление...' : 'Удалить сборку'}</Button>
        <Link href={`/api/builds/${build.id}/export`} prefetch={false} className="inline-flex items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800">Экспорт JSON</Link>
        <Link href="/saved-builds" className="inline-flex items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800">Назад к списку сборок</Link>
        <Link href="/manual-build" className="inline-flex items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800">Редактировать (TODO)</Link>
      </div>
    </section>
  );
}
