import type { Prisma } from '@prisma/client';

export type SortParam = 'price_asc' | 'price_desc' | 'manufacturer_asc';

export function getStringParam(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key)?.trim();
  return value ? value : undefined;
}

export function getNumberParam(params: URLSearchParams, key: string): number | undefined {
  const value = params.get(key);
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function getBooleanParam(params: URLSearchParams, key: string): boolean | undefined {
  const value = params.get(key)?.toLowerCase();
  if (!value) return undefined;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
}

export function buildPriceFilter(params: URLSearchParams): Prisma.IntFilter {
  const minPrice = getNumberParam(params, 'minPrice');
  const maxPrice = getNumberParam(params, 'maxPrice');

  return {
    ...(typeof minPrice === 'number' ? { gte: minPrice } : {}),
    ...(typeof maxPrice === 'number' ? { lte: maxPrice } : {})
  };
}

export function getSortOrder(params: URLSearchParams): SortParam {
  const sort = params.get('sort');
  if (sort === 'price_asc' || sort === 'price_desc' || sort === 'manufacturer_asc') {
    return sort;
  }

  return 'manufacturer_asc';
}

export function buildOrderBy(sort: SortParam, manufacturerField: string): Prisma.Enumerable<Record<string, 'asc' | 'desc'>> {
  if (sort === 'price_asc') return [{ price: 'asc' }, { [manufacturerField]: 'asc' }];
  if (sort === 'price_desc') return [{ price: 'desc' }, { [manufacturerField]: 'asc' }];
  return [{ [manufacturerField]: 'asc' }, { price: 'asc' }];
}
