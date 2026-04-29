import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.component.createMany({
    data: [
      { type: 'CPU', brand: 'AMD', model: 'Ryzen 5 7600', price: 22000 },
      { type: 'GPU', brand: 'NVIDIA', model: 'GeForce RTX 4060', price: 38000 },
      { type: 'RAM', brand: 'Kingston', model: '32GB DDR5', price: 11000 }
    ]
  });
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
