import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildOrderBy, buildPriceFilter, getBooleanParam, getNumberParam, getSortOrder, getStringParam } from '@/lib/api/query';

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const search = getStringParam(params, 'search');
    const minWattage = getNumberParam(params, 'minWattage');
    const has12vhpwr = getBooleanParam(params, 'has12vhpwr');

    const where = {
      ...(search ? { model: { contains: search, mode: 'insensitive' as const } } : {}),
      ...(getStringParam(params, 'manufacturer') ? { model: { contains: getStringParam(params, 'manufacturer') as string, mode: 'insensitive' as const } } : {}),
      ...(typeof minWattage === 'number' ? { wattage: { gte: minWattage } } : {}),
      ...(typeof has12vhpwr === 'boolean' ? { has12Vhpwr: has12vhpwr } : {}),
      price: buildPriceFilter(params)
    };

    const items = await prisma.psu.findMany({ where, orderBy: buildOrderBy(getSortOrder(params), 'model') });
    return NextResponse.json({ items, count: items.length });
  } catch {
    return NextResponse.json({ error: 'Не удалось получить список комплектующих.' }, { status: 500 });
  }
}
