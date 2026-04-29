'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Alert } from '@/src/components/ui/Alert';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { CompatibilityPanel } from '@/src/components/ui/CompatibilityPanel';
import { ComponentCard } from '@/src/components/ui/ComponentCard';
import { useToast } from '@/src/components/ui/Toast';
import type { AutoBuildApiResponse, AutoBuildResult } from '@/src/types/api';
import type { BuildGenerationParams, SelectedBuildComponents } from '@/src/types/build';

const RESOLUTION_LABELS: Record<BuildGenerationParams['targetResolution'], string> = {
  fullhd: 'Full HD',
  qhd: '2K / 1440p',
  uhd: '4K',
};

const PRIORITY_LABELS: Record<BuildGenerationParams['priority'], string> = {
  balanced: 'Сбалансированная сборка',
  performance: 'Максимальная производительность',
  budget: 'Минимальная стоимость',
  reliability: 'Высокая надёжность',
  upgrade: 'Апгрейдопригодность',
};

function parseBrands(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getBuildName(resolution: BuildGenerationParams['targetResolution'], budget: number): string {
  return `Автосборка для ${RESOLUTION_LABELS[resolution]} — ${budget.toLocaleString('ru-RU')} ₽`;
}

function componentCardsData(components: SelectedBuildComponents) {
  return [
    {
      key: 'cpu',
      title: 'CPU',
      subtitle: `${components.cpu.brand} ${components.cpu.name}`,
      price: components.cpu.price,
      specs: [
        { label: 'Сокет', value: components.cpu.socket },
        { label: 'Ядра/потоки', value: `${components.cpu.cores}/${components.cpu.threads}` },
        { label: 'TDP', value: `${components.cpu.tdp} Вт` },
        { label: 'Поколение', value: components.cpu.generation },
      ],
    },
    {
      key: 'motherboard',
      title: 'Motherboard',
      subtitle: components.motherboard.name,
      price: components.motherboard.price,
      specs: [
        { label: 'Сокет', value: components.motherboard.socket },
        { label: 'Чипсет', value: components.motherboard.chipset },
        { label: 'Память', value: components.motherboard.memoryType },
        { label: 'Форм-фактор', value: components.motherboard.formFactor },
      ],
    },
    {
      key: 'ram',
      title: 'RAM',
      subtitle: components.ram.name,
      price: components.ram.price,
      specs: [
        { label: 'Объём', value: `${components.ram.capacityGb} ГБ` },
        { label: 'Модули', value: `${components.ram.sticks} шт.` },
        { label: 'Частота', value: `${components.ram.frequencyMhz} МГц` },
        { label: 'Тип', value: components.ram.memoryType },
      ],
    },
    {
      key: 'gpu',
      title: 'GPU',
      subtitle: `${components.gpu.brand} ${components.gpu.name}`,
      price: components.gpu.price,
      specs: [
        { label: 'VRAM', value: `${components.gpu.vramGb} ГБ` },
        { label: 'PCIe', value: components.gpu.pcieInterface },
        { label: 'Потребление', value: `${components.gpu.powerConsumption} Вт` },
        { label: 'Длина', value: `${components.gpu.lengthMm} мм` },
      ],
    },
    {
      key: 'psu',
      title: 'PSU',
      subtitle: components.psu.name,
      price: components.psu.price,
      specs: [
        { label: 'Мощность', value: `${components.psu.wattage} Вт` },
        { label: 'Сертификат', value: components.psu.efficiencyRating },
        { label: '12VHPWR', value: components.psu.has12Vhpwr ? 'Да' : 'Нет' },
        { label: 'Надёжность', value: components.psu.name },
      ],
    },
    {
      key: 'storage',
      title: 'Storage',
      subtitle: components.storage.name,
      price: components.storage.price,
      specs: [
        { label: 'Тип', value: components.storage.type },
        { label: 'Интерфейс', value: components.storage.interface },
        { label: 'Объём', value: `${components.storage.capacityGb} ГБ` },
        { label: 'Чтение/запись', value: `${components.storage.readSpeedMBs}/${components.storage.writeSpeedMBs} МБ/с` },
      ],
    },
    {
      key: 'pcCase',
      title: 'Case',
      subtitle: components.pcCase.name,
      price: components.pcCase.price,
      specs: [
        { label: 'Форм-фактор', value: components.pcCase.formFactor },
        { label: 'Макс. длина GPU', value: `${components.pcCase.maxGpuLengthMm} мм` },
        { label: 'Макс. высота кулера', value: `${components.pcCase.maxCpuCoolerHeightMm} мм` },
        { label: 'Охлаждение', value: `Вентиляторов: ${components.pcCase.fanCountIncluded}` },
      ],
    },
    {
      key: 'cooler',
      title: 'Cooler',
      subtitle: components.cooler.name,
      price: components.cooler.price,
      specs: [
        { label: 'Тип', value: components.cooler.type },
        { label: 'TDP рейтинг', value: `${components.cooler.tdpRatingWatts} Вт` },
        { label: 'Высота', value: `${components.cooler.heightMm} мм` },
        { label: 'Шум', value: `${components.cooler.noiseLevelDb} дБ` },
      ],
    },
  ];
}

export default function AutoBuildPage() {
  const [budget, setBudget] = useState(120000);
  const [targetResolution, setTargetResolution] = useState<BuildGenerationParams['targetResolution']>('qhd');
  const [priority, setPriority] = useState<BuildGenerationParams['priority']>('balanced');
  const [preferredBrands, setPreferredBrands] = useState('');
  const [excludedBrands, setExcludedBrands] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<AutoBuildResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { showToast } = useToast();

  const cards = useMemo(() => (result ? componentCardsData(result.components) : []), [result]);

  useEffect(() => {
    void fetch('/api/auth/me').then((r) => setIsAuthenticated(r.ok)).catch(() => setIsAuthenticated(false));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations([]);
    setSaveMessage(null);
    setSaveError(null);

    const payload: BuildGenerationParams = {
      budget,
      targetResolution,
      priority,
      preferredBrands: parseBrands(preferredBrands),
      excludedBrands: parseBrands(excludedBrands),
    };

    try {
      const response = await fetch('/api/builds/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as AutoBuildApiResponse;

      if (!response.ok || !('result' in data)) {
        setResult(null);
        if ('error' in data) {
          setError(data.error || 'Не удалось выполнить автоподбор.');
          showToast('Ошибка генерации сборки.', 'error');
          setRecommendations(data.recommendations ?? []);
        } else {
          setError('Не удалось выполнить автоподбор.');
          setRecommendations([]);
        }
        return;
      }

      setResult(data.result);
    } catch (error) {
      console.error(error);
      setError('Произошла ошибка сети при автоподборе сборки.');
      showToast('Ошибка генерации сборки.', 'error');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function saveBuild() {
    if (!result) return;

    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const response = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: getBuildName(targetResolution, budget),
          budget,
          cpuId: result.components.cpu.id,
          motherboardId: result.components.motherboard.id,
          ramId: result.components.ram.id,
          gpuId: result.components.gpu.id,
          psuId: result.components.psu.id,
          storageId: result.components.storage.id,
          caseId: result.components.pcCase.id,
          coolerId: result.components.cooler.id,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setSaveError(data.error || 'Не удалось сохранить сборку.');
        return;
      }

      setSaveMessage('Сборка успешно сохранена.');
      showToast('Сборка успешно сохранена.', 'success');
    } catch (error) {
      console.error(error);
      setSaveError('Ошибка сети при сохранении сборки.');
      showToast('Ошибка сохранения сборки.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function exportJson() {
    if (!result) return;

    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'pc-auto-build.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    showToast('JSON успешно экспортирован.', 'success');
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Автоматический подбор игровой сборки</h2>
        <p className="mt-2 text-slate-300">
          Автоподбор использует алгоритм, который сначала выбирает видеокарту под разрешение и бюджет, затем
          подбирает совместимые процессор, плату, память, питание, корпус и охлаждение.
        </p>
      </div>

      <Card title="Параметры автоподбора" description="Укажите ключевые требования к будущему ПК.">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <label className="space-y-1 text-sm text-slate-300">
            <span>Бюджет, ₽</span>
            <input
              type="number"
              min={30000}
              value={budget}
              placeholder="120000"
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            />
          </label>

          <label className="space-y-1 text-sm text-slate-300">
            <span>Целевое разрешение</span>
            <select
              value={targetResolution}
              onChange={(e) => setTargetResolution(e.target.value as BuildGenerationParams['targetResolution'])}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            >
              <option value="fullhd">Full HD</option>
              <option value="qhd">2K / 1440p</option>
              <option value="uhd">4K</option>
            </select>
          </label>

          <label className="space-y-1 text-sm text-slate-300">
            <span>Приоритет сборки</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as BuildGenerationParams['priority'])}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            >
              <option value="balanced">Сбалансированная сборка</option>
              <option value="performance">Максимальная производительность</option>
              <option value="budget">Минимальная стоимость</option>
              <option value="reliability">Высокая надёжность</option>
              <option value="upgrade">Апгрейдопригодность</option>
            </select>
          </label>

          <label className="space-y-1 text-sm text-slate-300">
            <span>Предпочитаемые бренды</span>
            <input
              type="text"
              value={preferredBrands}
              placeholder="AMD, MSI, Kingston"
              onChange={(e) => setPreferredBrands(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            />
          </label>

          <label className="space-y-1 text-sm text-slate-300 md:col-span-2">
            <span>Исключённые бренды</span>
            <input
              type="text"
              value={excludedBrands}
              placeholder="Palit, ASRock"
              onChange={(e) => setExcludedBrands(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            />
          </label>

          <div className="md:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Подбираем совместимую конфигурацию...' : 'Подобрать сборку'}
            </Button>
          </div>
        </form>
      </Card>

      {error ? (
        <Alert variant="danger" title="Ошибка автоподбора">
          <p>{error}</p>
          {recommendations.length > 0 ? (
            <ul className="mt-2 list-inside list-disc">
              {recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </Alert>
      ) : null}

      {!result && !error ? (
        <Card>
          <p className="text-slate-400">Заполните параметры формы и запустите автоподбор, чтобы увидеть рекомендуемую сборку.</p>
        </Card>
      ) : null}

      {result ? (
        <div className="space-y-5">
          <Card title="Рекомендуемая игровая сборка">
            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-3">
              <p>Итоговая стоимость: {result.totalPrice.toLocaleString('ru-RU')} ₽</p>
              <p>Оценка совместимости: {result.compatibilityResult.compatibilityScore}/100</p>
              <p>Оценка производительности: {result.performanceScore}/100</p>
              <p>Энергопотребление: {result.compatibilityResult.totalPowerConsumption} Вт</p>
              <p>Рекомендуемый БП: {result.compatibilityResult.requiredPsuWattage} Вт</p>
              <p>Разрешение: {RESOLUTION_LABELS[targetResolution]}</p>
              <p className="sm:col-span-2 lg:col-span-3">Приоритет: {PRIORITY_LABELS[priority]}</p>
            </div>
            <div className="mt-4 max-w-md">
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card) => (
              <ComponentCard key={card.key} title={card.title} subtitle={card.subtitle} price={card.price} specs={card.specs} />
            ))}
          </div>

          <CompatibilityPanel result={result.compatibilityResult} />

          <Card title="Почему выбрана эта сборка">
            <p className="text-slate-300">{result.explanation}</p>
          </Card>

          {result.alternatives.length > 0 ? (
            <Card title="Альтернативные варианты">
              <div className="space-y-3 text-sm text-slate-300">
                {result.alternatives.map((alternative, index) => (
                  <div key={`${index}-${alternative.cpu?.id ?? 'alt'}`} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                    <p>CPU: {alternative.cpu ? alternative.cpu.name : '—'}</p>
                    <p>GPU: {alternative.gpu ? alternative.gpu.name : '—'}</p>
                    <p>RAM: {alternative.ram ? alternative.ram.name : '—'}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {saveMessage ? <Alert variant="success">{saveMessage}</Alert> : null}
          {saveError ? <Alert variant="danger">{saveError}</Alert> : null}

          <div className="flex flex-wrap gap-3">
            {isAuthenticated ? <Button onClick={saveBuild} disabled={saving}>{saving ? 'Сохраняем сборку...' : 'Сохранить сборку'}</Button> : <p className="text-sm text-slate-500">Сохранение доступно только авторизованным пользователям.</p>}
            <Button variant="secondary" onClick={exportJson}>Экспортировать JSON</Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
