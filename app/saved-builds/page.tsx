'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Alert } from '@/src/components/ui/Alert';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import type { SavedBuild, SavedBuildsApiResponse } from '@/src/types/build';

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Сначала новые' },
  { value: 'date_asc', label: 'Сначала старые' },
  { value: 'price_desc', label: 'Цена: по убыванию' },
  { value: 'price_asc', label: 'Цена: по возрастанию' },
  { value: 'budget_desc', label: 'Бюджет: по убыванию' },
  { value: 'budget_asc', label: 'Бюджет: по возрастанию' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

function formatPrice(value: number) {
  return `${value.toLocaleString('ru-RU')} ₽`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function SavedBuildsPage() {
  const [builds, setBuilds] = useState<SavedBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');

  useEffect(() => {
    async function loadBuilds() {
      setLoading(true);
      setLoadingError(null);
      try {
        const response = await fetch('/api/builds');
        const data = (await response.json()) as SavedBuildsApiResponse;
        if (!response.ok) {
          throw new Error(data.error || 'Не удалось получить сохранённые сборки.');
        }
        setBuilds(data.items);
      } catch (error) {
        setLoadingError(error instanceof Error ? error.message : 'Не удалось получить сохранённые сборки.');
      } finally {
        setLoading(false);
      }
    }
    void loadBuilds();
  }, []);

  const filteredBuilds = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const searched = normalizedSearch
      ? builds.filter((build) => build.name.toLowerCase().includes(normalizedSearch))
      : builds;

    return [...searched].sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price_desc':
          return b.totalPrice - a.totalPrice;
        case 'price_asc':
          return a.totalPrice - b.totalPrice;
        case 'budget_desc':
          return b.budget - a.budget;
        case 'budget_asc':
          return a.budget - b.budget;
        case 'date_desc':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [builds, search, sortBy]);

  async function onDeleteBuild(buildId: number, buildName: string) {
    const confirmed = window.confirm(`Удалить сборку «${buildName}»? Это действие нельзя отменить.`);
    if (!confirmed) return;

    setDeletingId(buildId);
    setDeleteError(null);
    setDeleteSuccess(null);

    try {
      const response = await fetch(`/api/builds/${buildId}`, { method: 'DELETE' });
      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setDeleteError(data.error || 'Не удалось удалить сборку.');
        return;
      }
      setBuilds((prev) => prev.filter((item) => item.id !== buildId));
      setDeleteSuccess(data.message || 'Сборка успешно удалена.');
    } catch {
      setDeleteError('Ошибка сети при удалении сборки.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold">Сохранённые сборки</h2>
        <p className="text-slate-300">Список ваших сохранённых конфигураций. Здесь можно найти сборку, экспортировать её в JSON и удалить ненужные варианты.</p>
      </div>

      {loadingError ? <Alert variant="danger" title="Ошибка загрузки">{loadingError}</Alert> : null}
      {deleteError ? <Alert variant="danger" title="Ошибка удаления">{deleteError}</Alert> : null}
      {deleteSuccess ? <Alert variant="success" title="Готово">{deleteSuccess}</Alert> : null}

      <Card title="Поиск и сортировка">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Поиск по названию
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Например: Сборка для QHD"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none transition focus:border-indigo-500"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Сортировка
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none transition focus:border-indigo-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {loading ? <p className="text-slate-300">Загружаем сохранённые сборки...</p> : null}

      {!loading && !loadingError && filteredBuilds.length === 0 ? (
        <Alert variant="info" title="Пока пусто">
          Сохранённые сборки не найдены. Создайте сборку в разделе «Ручная сборка» или «Автоподбор».
        </Alert>
      ) : null}

      {!loading && !loadingError && filteredBuilds.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredBuilds.map((build) => (
            <Card key={build.id} className="h-full">
              <div className="flex h-full flex-col gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-100">{build.name}</h3>
                  <p className="text-sm text-slate-400">Создано: {formatDate(build.createdAt)}</p>
                </div>

                <div className="grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
                  <p>Бюджет: <span className="font-semibold text-slate-100">{formatPrice(build.budget)}</span></p>
                  <p>Итоговая цена: <span className="font-semibold text-slate-100">{formatPrice(build.totalPrice)}</span></p>
                </div>

                <ul className="space-y-1 text-sm text-slate-300">
                  <li><span className="text-slate-400">CPU:</span> {build.cpu.brand} {build.cpu.name}</li>
                  <li><span className="text-slate-400">GPU:</span> {build.gpu.brand} {build.gpu.name}</li>
                  <li><span className="text-slate-400">Motherboard:</span> {build.motherboard.name}</li>
                  <li><span className="text-slate-400">RAM:</span> {build.ram.name}</li>
                  <li><span className="text-slate-400">PSU:</span> {build.psu.name}</li>
                  <li><span className="text-slate-400">Storage:</span> {build.storage.name}</li>
                  <li><span className="text-slate-400">Case:</span> {build.pcCase.name}</li>
                  {build.cooler ? <li><span className="text-slate-400">Cooler:</span> {build.cooler.name}</li> : null}
                </ul>

                <div className="mt-auto flex flex-wrap gap-2">
                  <Link href={`/builds/${build.id}`} className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-600">Открыть</Link>
                  <Link
                    href={`/api/builds/${build.id}/export`}
                    prefetch={false}
                    className="inline-flex items-center justify-center rounded-lg bg-transparent px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
                  >
                    Экспорт JSON
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDeleteBuild(build.id, build.name)}
                    disabled={deletingId === build.id}
                  >
                    {deletingId === build.id ? 'Удаление...' : 'Удалить'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
