import path from 'node:path';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkCompatibility } from '@/src/services/compatibility.service';
import { parsePositiveId } from '@/src/lib/builds';
import type { Cooler, Cpu, Gpu, Motherboard, PcCase, Psu, Ram, Storage } from '@/src/types/components';

const formatPrice = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;
const formatDate = (value: Date) => value.toLocaleString('ru-RU');

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const buildId = parsePositiveId(params.id);

  if (!buildId) {
    return NextResponse.json({ error: 'Некорректный идентификатор сборки.' }, { status: 400 });
  }

  try {
    const item = await prisma.build.findUnique({
      where: { id: buildId },
      include: { cpu: true, motherboard: true, ram: true, gpu: true, psu: true, storage: true, pcCase: true, cooler: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Сборка не найдена.' }, { status: 404 });
    }

    const compatibilityResult = checkCompatibility({
      cpu: {
        id: item.cpu.id,
        name: item.cpu.model,
        brand: item.cpu.brand,
        socket: item.cpu.socket,
        cores: item.cpu.cores,
        threads: item.cpu.threads,
        baseClockGhz: item.cpu.baseClockGhz,
        boostClockGhz: item.cpu.boostClockGhz,
        tdp: item.cpu.tdpWatts,
        integratedGraphics: item.cpu.integratedGraphics,
        generation: item.cpu.generation,
        price: item.cpu.price,
      } as Cpu,
      motherboard: { ...item.motherboard, name: item.motherboard.model } as Motherboard,
      ram: { ...item.ram, name: item.ram.model } as Ram,
      gpu: {
        id: item.gpu.id,
        name: item.gpu.model,
        brand: item.gpu.brand,
        chipset: item.gpu.chipset,
        vramGb: item.gpu.vramGb,
        lengthMm: item.gpu.lengthMm,
        powerConsumption: item.gpu.powerDrawWatts,
        recommendedPsuWattage: item.gpu.recommendedPsuWatts,
        pcieInterface: item.gpu.pcieInterface,
        price: item.gpu.price,
      } as Gpu,
      psu: { ...item.psu, name: item.psu.model } as Psu,
      storage: { ...item.storage, name: item.storage.model } as Storage,
      pcCase: { ...item.pcCase, name: item.pcCase.model } as PcCase,
      cooler: { ...item.cooler, name: item.cooler.model } as Cooler,
    });

    const reserveWatts = item.psu.wattage - compatibilityResult.totalPowerConsumption;
    const readyForBuild = compatibilityResult.isCompatible && reserveWatts > 0;

    const rows: string[][] = [
      ['CPU', item.cpu.brand, item.cpu.model, `${item.cpu.cores}C/${item.cpu.threads}T, ${item.cpu.socket}`, formatPrice(item.cpu.price)],
      ['Мат. плата', '—', item.motherboard.model, `${item.motherboard.socket}, ${item.motherboard.formFactor}`, formatPrice(item.motherboard.price)],
      ['RAM', '—', item.ram.model, `${item.ram.capacityGb} ГБ ${item.ram.memoryType}, ${item.ram.frequencyMhz} МГц`, formatPrice(item.ram.price)],
      ['GPU', item.gpu.brand, item.gpu.model, `${item.gpu.vramGb} ГБ, ${item.gpu.powerDrawWatts} Вт`, formatPrice(item.gpu.price)],
      ['Накопитель', '—', item.storage.model, `${item.storage.capacityGb} ГБ ${item.storage.type}`, formatPrice(item.storage.price)],
      ['БП', '—', item.psu.model, `${item.psu.wattage} Вт, ${item.psu.efficiencyRating}`, formatPrice(item.psu.price)],
      ['Корпус', '—', item.pcCase.model, `${item.pcCase.supportedMotherboardFormFactors}, GPU до ${item.pcCase.maxGpuLengthMm} мм`, formatPrice(item.pcCase.price)],
      ['Кулер', '—', item.cooler.model, `${item.cooler.tdpRatingWatts} Вт TDP, ${item.cooler.type}`, formatPrice(item.cooler.price)],
    ];

    const content: Content[] = [
      { text: 'Экспорт сборки ПК', style: 'header' },
      { text: `Название: ${item.name}` },
      { text: `Дата создания: ${formatDate(item.createdAt)}` },
      { text: `Бюджет: ${formatPrice(item.budget)}` },
      { text: `Итоговая стоимость: ${formatPrice(item.totalPrice)}`, margin: [0, 0, 0, 8] },
      { text: 'Комплектующие', style: 'section' },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', '*', 'auto'],
          body: [['Категория', 'Производитель', 'Модель', 'Характеристики', 'Цена'], ...rows],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 8],
      },
      { text: 'Проверка совместимости', style: 'section' },
      { text: `Общий статус: ${compatibilityResult.isCompatible ? 'Совместима' : 'Есть проблемы'}` },
      { text: `Ошибки: ${compatibilityResult.errors.length ? compatibilityResult.errors.join('; ') : 'Нет'}` },
      { text: `Предупреждения: ${compatibilityResult.warnings.length ? compatibilityResult.warnings.join('; ') : 'Нет'}`, margin: [0, 0, 0, 8] },
      { text: 'Энергопотребление', style: 'section' },
      { text: `Суммарное энергопотребление: ${compatibilityResult.totalPowerConsumption} Вт` },
      { text: `Мощность блока питания: ${item.psu.wattage} Вт` },
      { text: `Запас мощности: ${reserveWatts} Вт`, margin: [0, 0, 0, 8] },
      { text: 'Вывод', style: 'section' },
      { text: readyForBuild ? 'Конфигурация подходит для сборки.' : 'Конфигурация требует доработки перед сборкой.' },
    ];

    const { default: PdfPrinter } = await import('pdfmake/js/index.js');
    const PdfPrinterCtor = PdfPrinter as unknown as new (fonts: Record<string, Record<string, string>>) => { createPdfKitDocument: (docDefinition: TDocumentDefinitions) => NodeJS.EventEmitter & { end: () => void } };
    const fontDir = path.join(process.cwd(), 'node_modules', 'pdfmake', 'fonts');
    const printer = new PdfPrinterCtor({
      Roboto: {
        normal: path.join(fontDir, 'Roboto-Regular.ttf'),
        bold: path.join(fontDir, 'Roboto-Medium.ttf'),
        italics: path.join(fontDir, 'Roboto-Italic.ttf'),
        bolditalics: path.join(fontDir, 'Roboto-MediumItalic.ttf'),
      },
    });

    const docDefinition: TDocumentDefinitions = {
      content,
      defaultStyle: { font: 'Roboto', fontSize: 10 },
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        section: { fontSize: 13, bold: true, margin: [0, 8, 0, 6] },
      },
      pageMargins: [36, 36, 36, 36],
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve());
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pc-build-${buildId}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Не удалось экспортировать сборку в PDF.' }, { status: 500 });
  }
}
