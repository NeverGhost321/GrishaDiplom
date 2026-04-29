import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildOrderBy, buildPriceFilter, getNumberParam, getSortOrder, getStringParam } from '@/lib/api/query';

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const search = getStringParam(params, 'search');
    const minSizeGb = getNumberParam(params, 'minSizeGb');

    const where = {
      ...(search ? { model: { contains: search, mode: 'insensitive' as const } } : {}),
      ...(getStringParam(params, 'manufacturer') ? { model: { contains: getStringParam(params, 'manufacturer') as string, mode: 'insensitive' as const } } : {}),
      ...(getStringParam(params, 'memoryType') ? { memoryType: { contains: getStringParam(params, 'memoryType') as string, mode: 'insensitive' as const } } : {}),
      ...(typeof minSizeGb === 'number' ? { capacityGb: { gte: minSizeGb } } : {}),
      price: buildPriceFilter(params)
    };

    const items = await prisma.ram.findMany({ where, orderBy: buildOrderBy(getSortOrder(params), 'model') });
    return NextResponse.json({
      items: items.map((item) => ({ ...item, name: item.model })),
      count: items.length
    });
  } catch {
    return NextResponse.json({ error: 'Не удалось получить список комплектующих.' }, { status: 500 });
  }
}
