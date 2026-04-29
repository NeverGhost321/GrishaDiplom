import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildOrderBy, buildPriceFilter, getSortOrder, getStringParam } from '@/lib/api/query';

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const search = getStringParam(params, 'search');

    const where = {
      ...(search ? { model: { contains: search, mode: 'insensitive' as const } } : {}),
      ...(getStringParam(params, 'manufacturer') ? { model: { contains: getStringParam(params, 'manufacturer') as string, mode: 'insensitive' as const } } : {}),
      ...(getStringParam(params, 'formFactor') ? { formFactor: { contains: getStringParam(params, 'formFactor') as string, mode: 'insensitive' as const } } : {}),
      price: buildPriceFilter(params)
    };

    const items = await prisma.pcCase.findMany({ where, orderBy: buildOrderBy(getSortOrder(params), 'model') });
    return NextResponse.json({
      items: items.map((item) => ({ ...item, name: item.model })),
      count: items.length
    });
  } catch {
    return NextResponse.json({ error: 'Не удалось получить список комплектующих.' }, { status: 500 });
  }
}
