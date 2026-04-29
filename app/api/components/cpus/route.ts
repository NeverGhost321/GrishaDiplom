import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildOrderBy, buildPriceFilter, getSortOrder, getStringParam } from '@/lib/api/query';

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const search = getStringParam(params, 'search');
    const manufacturer = getStringParam(params, 'manufacturer');
    const socket = getStringParam(params, 'socket');

    const where = {
      ...(search
        ? {
            OR: [
              { brand: { contains: search, mode: 'insensitive' as const } },
              { model: { contains: search, mode: 'insensitive' as const } }
            ]
          }
        : {}),
      ...(manufacturer ? { brand: { equals: manufacturer, mode: 'insensitive' as const } } : {}),
      ...(socket ? { socket: { contains: socket, mode: 'insensitive' as const } } : {}),
      price: buildPriceFilter(params)
    };

    const items = await prisma.cpu.findMany({ where, orderBy: buildOrderBy(getSortOrder(params), 'brand') });
    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        name: item.model,
        tdp: item.tdpWatts,
      })),
      count: items.length
    });
  } catch {
    return NextResponse.json({ error: 'Не удалось получить список комплектующих.' }, { status: 500 });
  }
}
