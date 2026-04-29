# Конфигуратор игровых ПК (ВКР)

Базовый full-stack проект на **Next.js + TypeScript + Tailwind CSS + Prisma + SQLite** для разработки веб-приложения-конфигуратора игровых ПК.

## Быстрый старт

1. Установите зависимости:

```bash
npm install
```

2. Создайте `.env` по примеру:

```bash
cp .env.example .env
```

3. Сгенерируйте Prisma Client:

```bash
npm run prisma:generate
```

4. Примените миграции:

```bash
npm run prisma:migrate -- --name init
```

5. (Опционально) Заполните базу тестовыми данными:

```bash
npm run prisma:seed
```

6. Запустите приложение:

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3000`.

## Скрипты

- `npm run dev` — запуск в режиме разработки.
- `npm run build` — production-сборка.
- `npm run lint` — проверка ESLint.
- `npm run prisma:generate` — генерация Prisma Client.
- `npm run prisma:migrate` — запуск Prisma миграций.
- `npm run prisma:seed` — заполнение БД начальными данными.
