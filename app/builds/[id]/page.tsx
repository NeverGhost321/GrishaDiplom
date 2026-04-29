'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert } from '@/src/components/ui/Alert';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { CompatibilityPanel } from '@/src/components/ui/CompatibilityPanel';
import { LoadingCard } from '@/src/components/ui/LoadingCard';
import { useToast } from '@/src/components/ui/Toast';
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
  const [pdfExporting, setPdfExporting] = useState(false);
  const [jsonExporting, setJsonExporting] = useState(false);
  const { showToast } = useToast();

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
      } catch (error) {
        console.error(error);
        setError('Ошибка сети при загрузке сборки.');
        showToast('Ошибка загрузки данных.', 'error');
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
      showToast('Сборка успешно удалена.', 'success');
      router.push('/saved-builds');
    } catch (error) {
      console.error(error);
      setError('Не удалось удалить сборку.');
      showToast('Ошибка удаления сборки.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  async function onExportPdf() {
    if (!build) return;

    setPdfExporting(true);
    setError(null);

    try {
      const response = await fetch(`/api/builds/${build.id}/export/pdf`);
      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `pc-build-${build.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      showToast('PDF успешно экспортирован.', 'success');
    } catch (error) {
      console.error(error);
      setError('Не удалось скачать PDF-файл сборки.');
      showToast('Ошибка экспорта PDF.', 'error');
    } finally {
      setPdfExporting(false);
    }
  }

  if (loading) return <LoadingCard label="Загружаем детали сборки..." />;
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
          <li>Процессор: {build.cpu.brand} {build.cpu.name} — {formatPrice(build.cpu.price)}</li><li>Материнская плата: {build.motherboard.name} — {formatPrice(build.motherboard.price)}</li><li>ОЗУ: {build.ram.name} — {formatPrice(build.ram.price)}</li><li>Видеокарта: {build.gpu.brand} {build.gpu.name} — {formatPrice(build.gpu.price)}</li><li>Накопитель: {build.storage.name} — {formatPrice(build.storage.price)}</li><li>Блок питания: {build.psu.name} — {formatPrice(build.psu.price)}</li><li>Корпус: {build.pcCase.name} — {formatPrice(build.pcCase.price)}</li>{build.cooler ? <li>Кулер: {build.cooler.name} — {formatPrice(build.cooler.price)}</li> : <li>Кулер: отсутствует</li>}
        </ul>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button variant="danger" onClick={onDeleteBuild} disabled={deleting}>{deleting ? 'Удаление...' : 'Удалить сборку'}</Button>
        <Button variant="ghost" onClick={async () => { if (!build || jsonExporting) return; setJsonExporting(true); try { const response = await fetch(`/api/builds/${build.id}/export`); if (!response.ok) throw new Error(); const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `pc-build-${build.id}.json`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); showToast('JSON успешно экспортирован.', 'success'); } catch (error) { console.error(error); setError('Не удалось скачать JSON-файл сборки.'); showToast('Ошибка экспорта JSON.', 'error'); } finally { setJsonExporting(false); } }} disabled={jsonExporting}>{jsonExporting ? 'Экспорт JSON...' : 'Экспорт JSON'}</Button>
        <Button variant="secondary" onClick={onExportPdf} disabled={pdfExporting}>{pdfExporting ? 'Экспорт PDF...' : 'Экспорт PDF'}</Button>
        <Link href="/saved-builds" className="inline-flex items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800">Назад к списку сборок</Link>
        <Link href="/manual-build" className="inline-flex items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800">Редактирование будет расширено в следующих версиях</Link>
      </div>
    </section>
  );
}
