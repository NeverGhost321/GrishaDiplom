import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildOrderBy, buildPriceFilter, getSortOrder, getStringParam } from '@/lib/api/query';

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const search = getStringParam(params, 'search');

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
      ...(getStringParam(params, 'socket') ? { supportedSockets: { contains: getStringParam(params, 'socket') as string, mode: 'insensitive' as const } } : {}),
      ...(getStringParam(params, 'type') ? { type: { contains: getStringParam(params, 'type') as string, mode: 'insensitive' as const } } : {}),
      price: buildPriceFilter(params)
    };

    const items = await prisma.cooler.findMany({ where, orderBy: buildOrderBy(getSortOrder(params), 'model') });
    return NextResponse.json({
      items: items.map((item) => ({ ...item, name: item.model })),
      count: items.length
    });
  } catch {
    return NextResponse.json({ error: 'Не удалось получить список комплектующих.' }, { status: 500 });
  }
}
