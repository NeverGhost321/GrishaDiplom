'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert } from '@/src/components/ui/Alert';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { CompatibilityPanel } from '@/src/components/ui/CompatibilityPanel';
import { ComponentCard } from '@/src/components/ui/ComponentCard';
import { LoadingCard } from '@/src/components/ui/LoadingCard';
import { useToast } from '@/src/components/ui/Toast';
import type { ComponentsApiResponse, CompatibilityCheckApiResponse, SelectedIds } from '@/src/types/api';
import type { CompatibilityResult } from '@/src/types/compatibility';
import type { Cooler, Cpu, Gpu, Motherboard, PcCase, Psu, Ram, Storage } from '@/src/types/components';

type ManualBuildState = {
  cpus: Cpu[];
  motherboards: Motherboard[];
  rams: Ram[];
  gpus: Gpu[];
  psus: Psu[];
  storages: Storage[];
  cases: PcCase[];
  coolers: Cooler[];
};

const INITIAL_SELECTED: SelectedIds = {
  cpuId: null,
  motherboardId: null,
  ramId: null,
  gpuId: null,
  psuId: null,
  storageId: null,
  caseId: null,
  coolerId: null,
};

async function fetchCollection<T>(endpoint: string): Promise<T[]> {
  const response = await fetch(endpoint);
  const data = (await response.json()) as ComponentsApiResponse<T>;
  if (!response.ok) {
    throw new Error(data.error || `Ошибка загрузки ${endpoint}`);
  }
  return data.items;
}

function isCompleteSelection(selected: SelectedIds): selected is Record<keyof SelectedIds, number> {
  return Object.values(selected).every((value) => typeof value === 'number' && value > 0);
}

export default function ManualBuildPage() {
  const [components, setComponents] = useState<ManualBuildState>({
    cpus: [], motherboards: [], rams: [], gpus: [], psus: [], storages: [], cases: [], coolers: [],
  });
  const [selected, setSelected] = useState<SelectedIds>(INITIAL_SELECTED);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [compatibilityLoading, setCompatibilityLoading] = useState(false);
  const [compatibilityError, setCompatibilityError] = useState<string | null>(null);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setLoadingError(null);
      try {
        const [cpus, motherboards, rams, gpus, psus, storages, cases, coolers] = await Promise.all([
          fetchCollection<Cpu>('/api/components/cpus'),
          fetchCollection<Motherboard>('/api/components/motherboards'),
          fetchCollection<Ram>('/api/components/rams'),
          fetchCollection<Gpu>('/api/components/gpus'),
          fetchCollection<Psu>('/api/components/psus'),
          fetchCollection<Storage>('/api/components/storages'),
          fetchCollection<PcCase>('/api/components/cases'),
          fetchCollection<Cooler>('/api/components/coolers'),
        ]);
        setComponents({ cpus, motherboards, rams, gpus, psus, storages, cases, coolers });
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'Не удалось загрузить комплектующие.';
        setLoadingError(message);
        showToast('Ошибка загрузки данных.', 'error');
      } finally {
        setLoading(false);
      }
    }
    void loadAll();
  }, []);

  useEffect(() => {
    async function checkCompatibility() {
      if (!isCompleteSelection(selected)) {
        setCompatibilityResult(null);
        setCompatibilityError(null);
        return;
      }
      setCompatibilityLoading(true);
      setCompatibilityError(null);
      try {
        const response = await fetch('/api/compatibility/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selected),
        });
        const data = (await response.json()) as CompatibilityCheckApiResponse;
        if (!response.ok || !('result' in data)) {
          setCompatibilityResult(null);
          setCompatibilityError('error' in data ? data.error || 'Не удалось выполнить проверку совместимости.' : 'Не удалось выполнить проверку совместимости.');
          return;
        }
        setCompatibilityResult(data.result);
      } catch (error) {
        console.error(error);
        setCompatibilityResult(null);
        setCompatibilityError('Ошибка сети при проверке совместимости.');
        showToast('Ошибка проверки совместимости.', 'error');
      } finally {
        setCompatibilityLoading(false);
      }
    }
    void checkCompatibility();
  }, [selected]);

  const selectedComponents = useMemo(() => ({
    cpu: components.cpus.find((item) => item.id === selected.cpuId),
    motherboard: components.motherboards.find((item) => item.id === selected.motherboardId),
    ram: components.rams.find((item) => item.id === selected.ramId),
    gpu: components.gpus.find((item) => item.id === selected.gpuId),
    psu: components.psus.find((item) => item.id === selected.psuId),
    storage: components.storages.find((item) => item.id === selected.storageId),
    pcCase: components.cases.find((item) => item.id === selected.caseId),
    cooler: components.coolers.find((item) => item.id === selected.coolerId),
  }), [components, selected]);

  const allSelected = isCompleteSelection(selected);
  const canSave = allSelected && compatibilityResult && compatibilityResult.errors.length === 0;

  function updateSelect(field: keyof SelectedIds, value: string) {
    setSaveMessage(null);
    setSelected((prev) => ({ ...prev, [field]: value ? Number(value) : null }));
  }

  async function onSaveBuild() {
    if (!canSave) return;
    setSaveLoading(true);
    setSaveMessage(null);
    try {
      const response = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Ручная сборка — ${new Date().toLocaleDateString('ru-RU')}`,
          budget: compatibilityResult.totalPrice,
          ...selected,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setSaveMessage(data.error || 'Не удалось сохранить сборку.');
        return;
      }
      setSaveMessage('Сборка успешно сохранена.');
      showToast('Сборка успешно сохранена.', 'success');
    } catch (error) {
      console.error(error);
      setSaveMessage('Ошибка сети при сохранении сборки.');
      showToast('Ошибка сохранения сборки.', 'error');
    } finally {
      setSaveLoading(false);
    }
  }

  function onExportJson() {
    if (!allSelected) return;
    const payload = { selectedIds: selected, components: selectedComponents, compatibilityResult };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pc-manual-build.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('JSON успешно экспортирован.', 'success');
  }

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold">Ручная сборка игрового ПК</h2>
        <p className="text-slate-300">Ручная сборка позволяет самостоятельно выбрать комплектующие и сразу увидеть, какие аппаратные ограничения нарушены. Приложение проверяет сокет, память, питание, габариты, охлаждение, PCIe и баланс CPU/GPU.</p>
        <Alert variant="info" title="Что означают статусы">
          Красный — критическая несовместимость. Жёлтый — сборка возможна, но есть риск или ограничение. Зелёный — критических проблем не обнаружено.
        </Alert>
      </div>
      {loadingError ? <Alert variant="danger" title="Ошибка загрузки">{loadingError}</Alert> : null}
      {saveMessage ? <Alert variant={saveMessage.includes('успешно') ? 'success' : 'danger'} title="Сохранение">{saveMessage}</Alert> : null}

      <Card title="Выбор комплектующих" description="Выберите компоненты для ручной проверки совместимости.">
        {loading ? <LoadingCard label="Загружаем списки комплектующих..." /> : (
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Процессор" value={selected.cpuId} onChange={(v) => updateSelect('cpuId', v)} options={components.cpus.map((item) => ({ value: item.id, label: `${item.brand} ${item.name} — ${item.socket}, ${item.tdp} Вт — ${item.price.toLocaleString('ru-RU')} ₽` }))} />
            <Select label="Материнская плата" value={selected.motherboardId} onChange={(v) => updateSelect('motherboardId', v)} options={components.motherboards.map((item) => ({ value: item.id, label: `${item.name} — ${item.socket}, ${item.memoryType}, ${item.formFactor} — ${item.price.toLocaleString('ru-RU')} ₽` }))} />
            <Select label="Оперативная память" value={selected.ramId} onChange={(v) => updateSelect('ramId', v)} options={components.rams.map((item) => ({ value: item.id, label: `${item.name} — ${item.memoryType}, ${item.capacityGb} ГБ, ${item.frequencyMhz} МГц — ${item.price.toLocaleString('ru-RU')} ₽` }))} />
            <Select label="Видеокарта" value={selected.gpuId} onChange={(v) => updateSelect('gpuId', v)} options={components.gpus.map((item) => ({ value: item.id, label: `${item.brand} ${item.name} — ${item.vramGb} ГБ, ${item.powerConsumption} Вт — ${item.price.toLocaleString('ru-RU')} ₽` }))} />
            <Select label="Блок питания" value={selected.psuId} onChange={(v) => updateSelect('psuId', v)} options={components.psus.map((item) => ({ value: item.id, label: `${item.name} — ${item.wattage} Вт, ${item.efficiencyRating} — ${item.price.toLocaleString('ru-RU')} ₽` }))} />
            <Select label="Накопитель" value={selected.storageId} onChange={(v) => updateSelect('storageId', v)} options={components.storages.map((item) => ({ value: item.id, label: `${item.name} — ${item.type}, ${item.capacityGb} ГБ, ${item.interface} — ${item.price.toLocaleString('ru-RU')} ₽` }))} />
            <Select label="Корпус" value={selected.caseId} onChange={(v) => updateSelect('caseId', v)} options={components.cases.map((item) => ({ value: item.id, label: `${item.name} — ${item.formFactor}, GPU до ${item.maxGpuLengthMm} мм — ${item.price.toLocaleString('ru-RU')} ₽` }))} />
            <Select label="Система охлаждения" value={selected.coolerId} onChange={(v) => updateSelect('coolerId', v)} options={components.coolers.map((item) => ({ value: item.id, label: `${item.name} — ${item.type}, TDP ${item.tdpRatingWatts} Вт — ${item.price.toLocaleString('ru-RU')} ₽` }))} />
          </div>
        )}
      </Card>

      <div className="space-y-3">
        {!allSelected ? <Alert variant="info">Выберите все комплектующие, чтобы выполнить проверку совместимости.</Alert> : null}
        {compatibilityError ? <Alert variant="danger" title="Ошибка проверки">{compatibilityError}</Alert> : null}
        <CompatibilityPanel result={compatibilityResult} loading={compatibilityLoading} />
      </div>

      <Card title="Текущая конфигурация">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ComponentCard title="CPU" subtitle={selectedComponents.cpu ? `${selectedComponents.cpu.brand} ${selectedComponents.cpu.name}` : 'Не выбран'} price={selectedComponents.cpu?.price} specs={selectedComponents.cpu ? [{ label: 'Сокет', value: selectedComponents.cpu.socket }, { label: 'TDP', value: `${selectedComponents.cpu.tdp} Вт` }] : []} />
          <ComponentCard title="Motherboard" subtitle={selectedComponents.motherboard?.name ?? 'Не выбрана'} price={selectedComponents.motherboard?.price} specs={selectedComponents.motherboard ? [{ label: 'Сокет', value: selectedComponents.motherboard.socket }, { label: 'Память', value: selectedComponents.motherboard.memoryType }, { label: 'Форм-фактор', value: selectedComponents.motherboard.formFactor }] : []} />
          <ComponentCard title="RAM" subtitle={selectedComponents.ram?.name ?? 'Не выбрана'} price={selectedComponents.ram?.price} specs={selectedComponents.ram ? [{ label: 'Тип', value: selectedComponents.ram.memoryType }, { label: 'Объём', value: `${selectedComponents.ram.capacityGb} ГБ` }, { label: 'Частота', value: `${selectedComponents.ram.frequencyMhz} МГц` }] : []} />
          <ComponentCard title="GPU" subtitle={selectedComponents.gpu ? `${selectedComponents.gpu.brand} ${selectedComponents.gpu.name}` : 'Не выбрана'} price={selectedComponents.gpu?.price} specs={selectedComponents.gpu ? [{ label: 'VRAM', value: `${selectedComponents.gpu.vramGb} ГБ` }, { label: 'Потребление', value: `${selectedComponents.gpu.powerConsumption} Вт` }, { label: 'PCIe', value: selectedComponents.gpu.pcieInterface }] : []} />
          <ComponentCard title="PSU" subtitle={selectedComponents.psu?.name ?? 'Не выбран'} price={selectedComponents.psu?.price} specs={selectedComponents.psu ? [{ label: 'Мощность', value: `${selectedComponents.psu.wattage} Вт` }, { label: 'Сертификат', value: selectedComponents.psu.efficiencyRating }] : []} />
          <ComponentCard title="Storage" subtitle={selectedComponents.storage?.name ?? 'Не выбран'} price={selectedComponents.storage?.price} specs={selectedComponents.storage ? [{ label: 'Тип', value: selectedComponents.storage.type }, { label: 'Объём', value: `${selectedComponents.storage.capacityGb} ГБ` }, { label: 'Интерфейс', value: selectedComponents.storage.interface }] : []} />
          <ComponentCard title="Case" subtitle={selectedComponents.pcCase?.name ?? 'Не выбран'} price={selectedComponents.pcCase?.price} specs={selectedComponents.pcCase ? [{ label: 'Форм-фактор', value: selectedComponents.pcCase.formFactor }, { label: 'GPU', value: `${selectedComponents.pcCase.maxGpuLengthMm} мм` }] : []} />
          <ComponentCard title="Cooler" subtitle={selectedComponents.cooler?.name ?? 'Не выбран'} price={selectedComponents.cooler?.price} specs={selectedComponents.cooler ? [{ label: 'Тип', value: selectedComponents.cooler.type }, { label: 'TDP', value: `${selectedComponents.cooler.tdpRatingWatts} Вт` }, { label: 'Высота', value: `${selectedComponents.cooler.heightMm} мм` }] : []} />
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={onSaveBuild} disabled={!canSave || saveLoading}>{saveLoading ? 'Сохраняем...' : 'Сохранить сборку'}</Button>
        <Button variant="ghost" onClick={onExportJson} disabled={!allSelected}>Экспортировать JSON</Button>
      </div>
    </section>
  );
}

type SelectProps = {
  label: string;
  value: number | null;
  onChange: (value: string) => void;
  options: Array<{ value: number; label: string }>;
};

function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-200">
      {label}
      <select
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none transition focus:border-indigo-500"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Выберите компонент</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
