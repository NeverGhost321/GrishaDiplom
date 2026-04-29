import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildOrderBy, buildPriceFilter, getNumberParam, getSortOrder, getStringParam } from '@/lib/api/query';

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const search = getStringParam(params, 'search');
    const minVramGb = getNumberParam(params, 'minVramGb');

    const where = {
      ...(search
        ? {
            OR: [
              { brand: { contains: search, mode: 'insensitive' as const } },
              { model: { contains: search, mode: 'insensitive' as const } }
            ]
          }
        : {}),
      ...(getStringParam(params, 'manufacturer') ? { brand: { equals: getStringParam(params, 'manufacturer') as string, mode: 'insensitive' as const } } : {}),
      ...(getStringParam(params, 'gpuManufacturer') ? { brand: { equals: getStringParam(params, 'gpuManufacturer') as string, mode: 'insensitive' as const } } : {}),
      ...(typeof minVramGb === 'number' ? { vramGb: { gte: minVramGb } } : {}),
      price: buildPriceFilter(params)
    };

    const items = await prisma.gpu.findMany({ where, orderBy: buildOrderBy(getSortOrder(params), 'brand') });
    return NextResponse.json({ items, count: items.length });
  } catch {
    return NextResponse.json({ error: 'Не удалось получить список комплектующих.' }, { status: 500 });
  }
}
