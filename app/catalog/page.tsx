'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ComponentCard } from '@/src/components/ui/ComponentCard';
import { LoadingCard } from '@/src/components/ui/LoadingCard';
import { useToast } from '@/src/components/ui/Toast';
import type { CatalogCategory, CatalogFilters, ComponentsApiResponse } from '@/src/types/api';

type CpuItem = {
  id: number; model: string; brand: string; socket: string; generation: string; cores: number; threads: number; memoryType?: string | null; tdpWatts: number; price: number;
};
type MotherboardItem = {
  id: number; model: string; socket: string; chipset: string; memoryType: string; formFactor: string; pcieVersion: string; m2Slots: number; vrmQualityScore: number; price: number;
};
type RamItem = {
  id: number; model: string; memoryType: string; capacityGb: number; sticks: number; frequencyMhz: number; cl: number; price: number;
};
type GpuItem = {
  id: number; model: string; brand: string; chipset: string; vramGb: number; pcieInterface: string; powerDrawWatts: number; recommendedPsuWatts: number; lengthMm: number; price: number;
};
type PsuItem = {
  id: number; model: string; wattage: number; efficiencyRating: string; pcie8PinCount: number; has12Vhpwr: boolean; price: number;
};
type StorageItem = {
  id: number; model: string; type: string; interface: string; capacityGb: number; readSpeedMBs: number; formFactor: string; pcieVersion?: string | null; price: number;
};
type CaseItem = {
  id: number; model: string; supportedMotherboardFormFactors: string; maxGpuLengthMm: number; maxCpuCoolerHeightMm: number; formFactor: string; price: number;
};
type CoolerItem = {
  id: number; model: string; supportedSockets: string; tdpRatingWatts: number; heightMm: number; type: string; price: number;
};

type CatalogItem = CpuItem | MotherboardItem | RamItem | GpuItem | PsuItem | StorageItem | CaseItem | CoolerItem;

const CATEGORY_OPTIONS: Array<{ key: CatalogCategory; label: string; endpoint: string }> = [
  { key: 'cpus', label: 'Процессоры', endpoint: '/api/components/cpus' },
  { key: 'motherboards', label: 'Материнские платы', endpoint: '/api/components/motherboards' },
  { key: 'rams', label: 'Оперативная память', endpoint: '/api/components/rams' },
  { key: 'gpus', label: 'Видеокарты', endpoint: '/api/components/gpus' },
  { key: 'psus', label: 'Блоки питания', endpoint: '/api/components/psus' },
  { key: 'storages', label: 'Накопители', endpoint: '/api/components/storages' },
  { key: 'cases', label: 'Корпуса', endpoint: '/api/components/cases' },
  { key: 'coolers', label: 'Охлаждение', endpoint: '/api/components/coolers' }
];

const INITIAL_FILTERS: CatalogFilters = { search: '', manufacturer: '', sort: 'price_asc', minPrice: '', maxPrice: '' };

export default function CatalogPage() {
  const [category, setCategory] = useState<CatalogCategory>('cpus');
  const [draftFilters, setDraftFilters] = useState<CatalogFilters>(INITIAL_FILTERS);
  const [filters, setFilters] = useState<CatalogFilters>(INITIAL_FILTERS);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const activeCategory = useMemo(() => CATEGORY_OPTIONS.find((option) => option.key === category) ?? CATEGORY_OPTIONS[0], [category]);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search.trim()) params.set('search', filters.search.trim());
      if (filters.manufacturer.trim()) params.set('manufacturer', filters.manufacturer.trim());
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);

      const response = await fetch(`${activeCategory.endpoint}?${params.toString()}`);
      if (!response.ok) throw new Error('Не удалось загрузить данные каталога.');
      const data: ComponentsApiResponse<CatalogItem> = await response.json();
      setItems(data.items);
      setCount(data.count);
    } catch (requestError) {
      console.error(requestError);
      setItems([]);
      setCount(0);
      setError(requestError instanceof Error ? requestError.message : 'Неизвестная ошибка при загрузке каталога.');
      showToast('Ошибка загрузки данных.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory.endpoint, filters]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const renderSpecs = (item: CatalogItem) => {
    switch (category) {
      case 'cpus': {
        const cpu = item as CpuItem;
        return [
          { label: 'Сокет', value: cpu.socket }, { label: 'Поколение', value: cpu.generation }, { label: 'Ядра / потоки', value: `${cpu.cores} / ${cpu.threads}` },
          { label: 'Тип памяти', value: cpu.memoryType ?? '—' }, { label: 'TDP', value: `${cpu.tdpWatts} Вт` }, { label: 'Performance score', value: cpu.cores * 100 + cpu.threads * 40 }
        ];
      }
      case 'motherboards': { const mb = item as MotherboardItem; return [
        { label: 'Сокет', value: mb.socket }, { label: 'Чипсет', value: mb.chipset }, { label: 'Тип памяти', value: mb.memoryType }, { label: 'Форм-фактор', value: mb.formFactor },
        { label: 'PCIe', value: mb.pcieVersion }, { label: 'M.2 слоты', value: mb.m2Slots }, { label: 'VRM score', value: mb.vrmQualityScore }
      ]; }
      case 'rams': { const ram = item as RamItem; return [
        { label: 'Тип памяти', value: ram.memoryType }, { label: 'Объём', value: `${ram.capacityGb} ГБ` }, { label: 'Модулей', value: ram.sticks }, { label: 'Частота', value: `${ram.frequencyMhz} МГц` }, { label: 'Тайминги', value: `CL${ram.cl}` }
      ]; }
      case 'gpus': { const gpu = item as GpuItem; return [
        { label: 'GPU производитель', value: gpu.chipset }, { label: 'Вендор', value: gpu.brand }, { label: 'VRAM', value: `${gpu.vramGb} ГБ` }, { label: 'PCIe', value: gpu.pcieInterface }, { label: 'Потребление', value: `${gpu.powerDrawWatts} Вт` },
        { label: 'Рекоменд. БП', value: `${gpu.recommendedPsuWatts} Вт` }, { label: 'Длина', value: `${gpu.lengthMm} мм` }, { label: 'Performance score', value: gpu.vramGb * 120 }
      ]; }
      case 'psus': { const psu = item as PsuItem; return [
        { label: 'Мощность', value: `${psu.wattage} Вт` }, { label: 'Сертификат', value: psu.efficiencyRating }, { label: 'PCIe коннекторы', value: psu.pcie8PinCount }, { label: '12VHPWR', value: psu.has12Vhpwr ? 'Да' : 'Нет' }, { label: 'Надёжность', value: Math.min(100, psu.wattage / 10) }
      ]; }
      case 'storages': { const storage = item as StorageItem; return [
        { label: 'Интерфейс', value: storage.interface }, { label: 'PCIe', value: storage.pcieVersion ?? '—' }, { label: 'Объём', value: `${storage.capacityGb} ГБ` }, { label: 'Чтение', value: `${storage.readSpeedMBs} МБ/с` }, { label: 'Форм-фактор', value: storage.formFactor }
      ]; }
      case 'cases': { const pcCase = item as CaseItem; return [
        { label: 'Форм-факторы MB', value: pcCase.supportedMotherboardFormFactors }, { label: 'Макс. длина GPU', value: `${pcCase.maxGpuLengthMm} мм` }, { label: 'Макс. высота кулера', value: `${pcCase.maxCpuCoolerHeightMm} мм` }, { label: 'Форм-фактор БП', value: pcCase.formFactor }
      ]; }
      case 'coolers': { const cooler = item as CoolerItem; return [
        { label: 'Сокеты', value: cooler.supportedSockets }, { label: 'TDP охлаждения', value: `${cooler.tdpRatingWatts} Вт` }, { label: 'Высота', value: `${cooler.heightMm} мм` }, { label: 'Тип', value: cooler.type }
      ]; }
    }
  };

  return (<section className="space-y-6">
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-slate-200">
      <h2 className="text-2xl font-bold text-slate-100">Каталог комплектующих</h2>
      <p className="mt-2 text-sm text-slate-300">Каталог содержит демонстрационные комплектующие, используемые для проверки алгоритмов совместимости и автоподбора. Цены и характеристики являются примерными.</p>
    </div>
    <div className="flex flex-wrap gap-2">{CATEGORY_OPTIONS.map((option)=><button key={option.key} onClick={()=>setCategory(option.key)} className={`rounded-lg px-3 py-2 text-sm ${category===option.key?'bg-blue-500/20 text-blue-300':'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}>{option.label}</button>)}</div>
    <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-2 lg:grid-cols-3">
      <input value={draftFilters.search} onChange={(e)=>setDraftFilters((p)=>({...p,search:e.target.value}))} placeholder="Поиск по модели или производителю" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
      <input value={draftFilters.manufacturer} onChange={(e)=>setDraftFilters((p)=>({...p,manufacturer:e.target.value}))} placeholder="Например: AMD, ASUS, MSI" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
      <input type="number" value={draftFilters.minPrice} onChange={(e)=>setDraftFilters((p)=>({...p,minPrice:e.target.value}))} placeholder="Минимальная цена" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
      <input type="number" value={draftFilters.maxPrice} onChange={(e)=>setDraftFilters((p)=>({...p,maxPrice:e.target.value}))} placeholder="Максимальная цена" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
      <select value={draftFilters.sort} onChange={(e)=>setDraftFilters((p)=>({...p,sort:e.target.value as CatalogFilters['sort']}))} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
        <option value="price_asc">Сначала дешёвые</option><option value="price_desc">Сначала дорогие</option><option value="manufacturer_asc">По производителю</option>
      </select>
      <div className="flex gap-2"><button onClick={()=>setFilters(draftFilters)} className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-slate-950">Применить фильтры</button><button onClick={()=>{setDraftFilters(INITIAL_FILTERS);setFilters(INITIAL_FILTERS);}} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300">Сбросить</button></div>
    </div>
    <div className="text-sm text-slate-300">Найдено элементов: <span className="font-semibold text-slate-100">{count}</span></div>
    {isLoading ? <LoadingCard label="Загрузка данных..." /> : null}
    {error ? <div className="rounded-xl border border-red-500/50 bg-red-950/20 p-5 text-red-200">{error}</div> : null}
    {!isLoading && !error && items.length === 0 ? <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-300">Каталог пуст. Проверьте, что seed-данные были загружены в базу данных.</div> : null}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((item)=><ComponentCard key={item.id} title={item.model} subtitle={('brand' in item && item.brand) ? item.brand : undefined} price={item.price} specs={renderSpecs(item)} />)}</div>
  </section>);
}
