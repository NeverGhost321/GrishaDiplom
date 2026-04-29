import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.build.deleteMany();
  await prisma.cpu.deleteMany();
  await prisma.motherboard.deleteMany();
  await prisma.ram.deleteMany();
  await prisma.gpu.deleteMany();
  await prisma.psu.deleteMany();
  await prisma.storage.deleteMany();
  await prisma.pcCase.deleteMany();
  await prisma.cooler.deleteMany();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
