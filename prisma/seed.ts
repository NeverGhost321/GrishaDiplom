import { PrismaClient } from '@prisma/client/index';

const prisma = new PrismaClient();

async function main() {
  // Очищаем таблицы с учётом потенциальных внешних ключей на конфигурации
  await prisma.$transaction([
    prisma.$executeRawUnsafe('DELETE FROM "Cooler";'),
    prisma.$executeRawUnsafe('DELETE FROM "PcCase";'),
    prisma.$executeRawUnsafe('DELETE FROM "Storage";'),
    prisma.$executeRawUnsafe('DELETE FROM "Psu";'),
    prisma.$executeRawUnsafe('DELETE FROM "Gpu";'),
    prisma.$executeRawUnsafe('DELETE FROM "Ram";'),
    prisma.$executeRawUnsafe('DELETE FROM "Motherboard";'),
    prisma.$executeRawUnsafe('DELETE FROM "Cpu";')
  ]);

  // CPU
  await prisma.$executeRawUnsafe(`
    INSERT INTO "Cpu" (model, brand, socket, cores, threads, baseClockGhz, boostClockGhz, tdpWatts, integratedGraphics, generation, price) VALUES
    ('Intel Core i5-12400F', 'Intel', 'LGA1700', 6, 12, 2.5, 4.4, 65, 0, '12th Gen', 16500),
    ('Intel Core i5-13600K', 'Intel', 'LGA1700', 14, 20, 3.5, 5.1, 125, 1, '13th Gen', 26500),
    ('Intel Core i7-14700K', 'Intel', 'LGA1700', 20, 28, 3.4, 5.6, 125, 1, '14th Gen', 45500),
    ('AMD Ryzen 5 5600', 'AMD', 'AM4', 6, 12, 3.5, 4.4, 65, 0, 'Ryzen 5000', 11500),
    ('AMD Ryzen 7 5800X3D', 'AMD', 'AM4', 8, 16, 3.4, 4.5, 105, 0, 'Ryzen 5000', 26500),
    ('AMD Ryzen 5 7600', 'AMD', 'AM5', 6, 12, 3.8, 5.1, 65, 1, 'Ryzen 7000', 21500),
    ('AMD Ryzen 7 7800X3D', 'AMD', 'AM5', 8, 16, 4.2, 5.0, 120, 1, 'Ryzen 7000', 38500),
    ('AMD Ryzen 9 7900X', 'AMD', 'AM5', 12, 24, 4.7, 5.6, 170, 1, 'Ryzen 7000', 45500);
  `);

  // Motherboard
  await prisma.$executeRawUnsafe(`
    INSERT INTO "Motherboard" (model, socket, chipset, supportedCpuGenerations, memoryType, maxRamGb, maxRamFrequency, ramSlots, pcieVersion, m2Slots, sataPorts, formFactor, vrmQualityScore, biosVersion, price) VALUES
    ('MSI PRO B660M-A DDR4', 'LGA1700', 'B660', '12th Gen,13th Gen', 'DDR4', 128, 4800, 4, '4.0', 2, 6, 'mATX', 72, '7D43v1F', 12500),
    ('ASUS TUF GAMING Z790-PLUS WIFI', 'LGA1700', 'Z790', '12th Gen,13th Gen,14th Gen', 'DDR5', 192, 7200, 4, '5.0', 4, 4, 'ATX', 90, '1801', 29900),
    ('Gigabyte B760M DS3H DDR4', 'LGA1700', 'B760', '12th Gen,13th Gen,14th Gen', 'DDR4', 128, 5333, 4, '4.0', 2, 4, 'mATX', 68, 'F12', 11900),
    ('ASRock Z690 Steel Legend', 'LGA1700', 'Z690', '12th Gen,13th Gen', 'DDR5', 128, 6400, 4, '5.0', 3, 8, 'ATX', 84, '12.03', 21400),
    ('MSI B550-A PRO', 'AM4', 'B550', 'Ryzen 3000,Ryzen 5000', 'DDR4', 128, 4400, 4, '4.0', 2, 6, 'ATX', 78, '7C56vAF', 12900),
    ('ASUS ROG Strix X570-E Gaming', 'AM4', 'X570', 'Ryzen 3000,Ryzen 5000', 'DDR4', 128, 5100, 4, '4.0', 2, 8, 'ATX', 88, '5003', 24900),
    ('Gigabyte B650M K', 'AM5', 'B650', 'Ryzen 7000', 'DDR5', 192, 6400, 4, '4.0', 2, 4, 'mATX', 76, 'F4', 13900),
    ('ASRock A620M-HDV/M.2+', 'AM5', 'A620', 'Ryzen 7000', 'DDR5', 96, 6000, 2, '4.0', 0, 4, 'mATX', 55, '2.10', 8900);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "Ram" (model, memoryType, capacityGb, sticks, frequencyMhz, cl, voltage, rgb, price) VALUES
    ('Kingston Fury Beast 16GB (2x8) DDR4-3200', 'DDR4', 16, 2, 3200, 16, 1.35, 0, 5200),
    ('Corsair Vengeance LPX 32GB (2x16) DDR4-3200', 'DDR4', 32, 2, 3200, 16, 1.35, 0, 8800),
    ('G.Skill Ripjaws V 32GB (2x16) DDR4-3600', 'DDR4', 32, 2, 3600, 18, 1.35, 0, 9400),
    ('Kingston Fury Beast 16GB (2x8) DDR5-5200', 'DDR5', 16, 2, 5200, 40, 1.25, 0, 7200),
    ('ADATA XPG Lancer 32GB (2x16) DDR5-5600', 'DDR5', 32, 2, 5600, 36, 1.25, 1, 12200),
    ('G.Skill Trident Z5 32GB (2x16) DDR5-6000', 'DDR5', 32, 2, 6000, 30, 1.35, 1, 15800),
    ('Kingston Fury Renegade 64GB (2x32) DDR5-6000', 'DDR5', 64, 2, 6000, 32, 1.35, 1, 26800),
    ('Crucial 16GB (2x8) DDR4-2666', 'DDR4', 16, 2, 2666, 19, 1.20, 0, 4300);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "Gpu" (model, brand, chipset, vramGb, lengthMm, powerDrawWatts, recommendedPsuWatts, pcieInterface, price) VALUES
    ('NVIDIA RTX 3060', 'NVIDIA', 'RTX 3060', 12, 242, 170, 550, '4.0 x16', 31500),
    ('NVIDIA RTX 4060', 'NVIDIA', 'RTX 4060', 8, 244, 115, 500, '4.0 x8', 35900),
    ('NVIDIA RTX 4070', 'NVIDIA', 'RTX 4070', 12, 300, 200, 650, '4.0 x16', 61900),
    ('NVIDIA RTX 4080', 'NVIDIA', 'RTX 4080', 16, 336, 320, 750, '4.0 x16', 121000),
    ('NVIDIA RTX 4090', 'NVIDIA', 'RTX 4090', 24, 357, 450, 1000, '4.0 x16', 224000),
    ('AMD RX 6600', 'AMD', 'RX 6600', 8, 282, 132, 500, '4.0 x8', 24900),
    ('AMD RX 7800 XT', 'AMD', 'RX 7800 XT', 16, 320, 263, 700, '4.0 x16', 67900),
    ('AMD RX 7900 XTX', 'AMD', 'RX 7900 XTX', 24, 287, 355, 850, '4.0 x16', 119000);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "Psu" (model, wattage, efficiencyRating, has12Vhpwr, pcie8PinCount, atxVersion, modular, price) VALUES
    ('Cooler Master MWE Bronze V2 500', 500, '80+ Bronze', 0, 2, 'ATX 2.52', 0, 4900),
    ('DeepCool PM650D Gold', 650, '80+ Gold', 0, 4, 'ATX 2.52', 0, 7900),
    ('be quiet! Pure Power 12 M 750W', 750, '80+ Gold', 1, 4, 'ATX 3.0', 1, 12100),
    ('Corsair RM850e', 850, '80+ Gold', 1, 4, 'ATX 3.0', 1, 14900),
    ('Seasonic PRIME PX-1000', 1000, '80+ Platinum', 1, 6, 'ATX 3.0', 1, 24500),
    ('MSI MEG Ai1300P PCIE5', 1200, '80+ Platinum', 1, 8, 'ATX 3.0', 1, 38900);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "Storage" (model, type, interface, capacityGb, readSpeedMBs, writeSpeedMBs, formFactor, price) VALUES
    ('Samsung 870 EVO 500GB', 'SSD', 'SATA 6Gb/s', 500, 560, 530, '2.5"', 5400),
    ('Crucial MX500 1TB', 'SSD', 'SATA 6Gb/s', 1000, 560, 510, '2.5"', 8900),
    ('WD Blue SN570 500GB', 'SSD', 'NVMe PCIe 3.0 x4', 500, 3500, 2300, 'M.2 2280', 4800),
    ('Kingston NV2 1TB', 'SSD', 'NVMe PCIe 3.0 x4', 1000, 3500, 2100, 'M.2 2280', 6800),
    ('Samsung 990 EVO 1TB', 'SSD', 'NVMe PCIe 4.0 x4', 1000, 5000, 4200, 'M.2 2280', 9900),
    ('WD Black SN850X 2TB', 'SSD', 'NVMe PCIe 4.0 x4', 2000, 7300, 6600, 'M.2 2280', 18400);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "PcCase" (model, formFactor, supportedMotherboardFormFactors, maxGpuLengthMm, maxCpuCoolerHeightMm, radiatorSupport, fanCountIncluded, airflowScore, price) VALUES
    ('DeepCool MATREXX 30 SI', 'compact mATX', 'mATX,Mini-ITX', 250, 151, '120', 1, 45, 3900),
    ('Zalman i3 NEO', 'mid tower ATX', 'ATX,mATX,Mini-ITX', 355, 160, '240', 4, 70, 6200),
    ('Lian Li LANCOOL 216', 'large ATX', 'E-ATX,ATX,mATX,Mini-ITX', 392, 180, '360', 3, 90, 12400),
    ('Aerocool CS-107', 'compact mATX', 'mATX,Mini-ITX', 286, 157, '240', 1, 48, 4100),
    ('Cooler Master Q300L V2', 'compact mATX', 'mATX,Mini-ITX', 360, 159, '240', 1, 65, 5200),
    ('Fractal Design Torrent', 'large ATX', 'E-ATX,ATX,mATX,Mini-ITX', 423, 188, '420', 5, 95, 22900);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "Cooler" (model, type, supportedSockets, tdpRatingWatts, heightMm, radiatorSizeMm, noiseLevelDb, price) VALUES
    ('DeepCool GAMMAXX 200 V2', 'Air', 'LGA1700,AM4', 95, 131, 0, 30, 1900),
    ('ID-COOLING SE-224-XTS', 'Air', 'LGA1700,AM4,AM5', 180, 154, 0, 28, 3200),
    ('Thermalright Peerless Assassin 120 SE', 'Air', 'LGA1700,AM4,AM5', 250, 155, 0, 27, 5200),
    ('DeepCool LE520', 'AIO', 'LGA1700,AM4,AM5', 260, 0, 240, 32, 7600),
    ('Arctic Liquid Freezer III 360', 'AIO', 'LGA1700,AM4,AM5', 320, 0, 360, 31, 13900),
    ('Noctua NH-L9a-AM5', 'Air', 'AM5', 70, 37, 0, 24, 4900);
  `);

  console.log('✅ Demo seed data inserted successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
