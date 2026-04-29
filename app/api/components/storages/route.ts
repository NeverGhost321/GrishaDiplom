import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildOrderBy, buildPriceFilter, getNumberParam, getSortOrder, getStringParam } from '@/lib/api/query';

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const search = getStringParam(params, 'search');
    const minCapacityGb = getNumberParam(params, 'minCapacityGb');

    const where = {
      ...(search
        ? {
            OR: [
              { model: { contains: search, mode: 'insensitive' as const } },
              { type: { contains: search, mode: 'insensitive' as const } }
            ]
          }
        : {}),
      ...(getStringParam(params, 'manufacturer') ? { model: { contains: getStringParam(params, 'manufacturer') as string, mode: 'insensitive' as const } } : {}),
      ...(getStringParam(params, 'interfaceType') ? { interface: { contains: getStringParam(params, 'interfaceType') as string, mode: 'insensitive' as const } } : {}),
      ...(typeof minCapacityGb === 'number' ? { capacityGb: { gte: minCapacityGb } } : {}),
      price: buildPriceFilter(params)
    };

    const items = await prisma.storage.findMany({ where, orderBy: buildOrderBy(getSortOrder(params), 'model') });
    return NextResponse.json({ items, count: items.length });
  } catch {
    return NextResponse.json({ error: 'Не удалось получить список комплектующих.' }, { status: 500 });
  }
}
