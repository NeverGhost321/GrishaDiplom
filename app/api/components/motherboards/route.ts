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
              { chipset: { contains: search, mode: 'insensitive' as const } }
            ]
          }
        : {}),
      ...(getStringParam(params, 'manufacturer')
        ? { model: { contains: getStringParam(params, 'manufacturer') as string, mode: 'insensitive' as const } }
        : {}),
      ...(getStringParam(params, 'socket') ? { socket: { contains: getStringParam(params, 'socket') as string, mode: 'insensitive' as const } } : {}),
      ...(getStringParam(params, 'memoryType') ? { memoryType: { contains: getStringParam(params, 'memoryType') as string, mode: 'insensitive' as const } } : {}),
      ...(getStringParam(params, 'formFactor') ? { formFactor: { contains: getStringParam(params, 'formFactor') as string, mode: 'insensitive' as const } } : {}),
      ...(getStringParam(params, 'chipset') ? { chipset: { contains: getStringParam(params, 'chipset') as string, mode: 'insensitive' as const } } : {}),
      price: buildPriceFilter(params)
    };

    const items = await prisma.motherboard.findMany({ where, orderBy: buildOrderBy(getSortOrder(params), 'model') });
    return NextResponse.json({
      items: items.map((item) => ({ ...item, name: item.model })),
      count: items.length
    });
  } catch {
    return NextResponse.json({ error: 'Не удалось получить список комплектующих.' }, { status: 500 });
  }
}
