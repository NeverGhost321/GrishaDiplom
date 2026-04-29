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

## Seed-данные (демо)

Проект содержит демонстрационный `prisma/seed.ts` с реалистичными комплектующими для конфигуратора игровых ПК:
- CPU, Motherboard, RAM, GPU, PSU, Storage, PcCase, Cooler;
- есть как совместимые, так и намеренно конфликтные сочетания для демонстрации валидаций совместимости;
- цены в seed указаны в рублях;
- данные предназначены только для демонстрации и тестирования UI/логики, не являются рыночной аналитикой.

Запуск seed:

```bash
npm run prisma:seed
```

## Скрипты

- `npm run dev` — запуск в режиме разработки.
- `npm run build` — production-сборка.
- `npm run lint` — проверка ESLint.
- `npm run prisma:generate` — генерация Prisma Client.
- `npm run prisma:migrate` — запуск Prisma миграций.
- `npm run prisma:seed` — заполнение БД начальными данными.

## Слой `src/types` и `src/lib`

Добавлены базовые TypeScript-типы домена сборки ПК и утилиты для будущей бизнес-логики проверки совместимости и генерации конфигураций:
- `src/types/components.ts` — типы комплектующих (CPU, GPU, RAM и др.), категории и общий union-тип;
- `src/types/build.ts` — типы выбранной сборки, параметров генерации и результата генерации;
- `src/types/compatibility.ts` — стандартизированный формат результата проверки совместимости;
- `src/lib/constants.ts` — константы порогов и резервов питания/баланса;
- `src/lib/scoring.ts` — расчёт цены, энергопотребления, требуемой мощности БП, итогового score и CPU/GPU-баланса.

На следующем шаге эти типы и утилиты будут использоваться в сервисах подбора и валидации совместимости компонентов.

## Проверка совместимости

В проект добавлен сервис `CompatibilityService` (`src/services/compatibility.service.ts`) с функцией `checkCompatibility(components)`, которая возвращает стандартизированный `CompatibilityResult`.

Сервис выполняет проверку:
- CPU ↔ Motherboard (сокет, поколение, VRM, возможное обновление BIOS);
- Motherboard ↔ RAM и CPU ↔ RAM (тип памяти, частоты, объём, количество модулей);
- GPU ↔ Motherboard (сравнение версий PCIe);
- GPU ↔ PSU (рекомендованная и расчётная мощность, 12VHPWR, надёжность БП);
- GPU/Cooler/Motherboard/PSU ↔ Case (габариты и поддержка форм-факторов);
- Storage ↔ Motherboard (SATA/M.2/NVMe и PCIe-ограничения);
- Cooler ↔ CPU/Case (TDP и высота);
- CPU/GPU bottleneck с рекомендациями по балансу;
- расчёт итоговых метрик: `totalPowerConsumption`, `requiredPsuWattage`, `totalPrice`, `compatibilityScore`.

## Тестирование

Для автоматической проверки `CompatibilityService` используется **Vitest**.

Запуск тестов:

```bash
npm test
```

Также доступен watch-режим:

```bash
npm run test:watch
```

Основные покрытые сценарии:
- полностью совместимая сборка без ошибок и предупреждений;
- несовместимости CPU/Motherboard (сокет, поколение), RAM и кулера;
- недостаточная мощность БП и габаритные ограничения корпуса;
- ограничения по PCIe, предупреждения по BIOS и по частоте RAM;
- отсутствие M.2 слотов для NVMe;
- предупреждения по bottleneck CPU/GPU и отсутствию 12VHPWR для мощных видеокарт.
