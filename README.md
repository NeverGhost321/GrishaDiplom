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

## API комплектующих

Доступны API-эндпоинты Next.js App Router для получения списков комплектующих из базы данных:

- `GET /api/components/cpus`
- `GET /api/components/motherboards`
- `GET /api/components/rams`
- `GET /api/components/gpus`
- `GET /api/components/psus`
- `GET /api/components/storages`
- `GET /api/components/cases`
- `GET /api/components/coolers`

Каждый эндпоинт возвращает JSON вида:

```json
{
  "items": [],
  "count": 0
}
```

Поддерживаются общие query-параметры:
- `search` — поиск по производителю/модели;
- `manufacturer` — фильтр по производителю;
- `minPrice`, `maxPrice` — фильтр по цене;
- `sort` — `price_asc`, `price_desc`, `manufacturer_asc`.

Примеры запросов:
- `GET /api/components/cpus`
- `GET /api/components/gpus?minVramGb=8&sort=price_asc`
- `GET /api/components/motherboards?socket=AM5&memoryType=DDR5`

## API проверки совместимости

Добавлен endpoint для проверки совместимости выбранных пользователем комплектующих:

- `POST /api/compatibility/check`

### Пример запроса

```http
POST /api/compatibility/check
Content-Type: application/json
```

```json
{
  "cpuId": 1,
  "motherboardId": 1,
  "ramId": 1,
  "gpuId": 1,
  "psuId": 1,
  "storageId": 1,
  "caseId": 1,
  "coolerId": 1
}
```

### Пример успешного ответа

```json
{
  "result": {
    "isCompatible": true,
    "errors": [],
    "warnings": [],
    "recommendations": [
      "Конфигурация совместима и не содержит заметных аппаратных рисков."
    ],
    "totalPowerConsumption": 365,
    "requiredPsuWattage": 438,
    "totalPrice": 120000,
    "compatibilityScore": 93
  }
}
```

### Пример ответа с ошибкой 400

```json
{
  "error": "Некорректные данные для проверки совместимости.",
  "details": [
    "Отсутствует обязательное поле gpuId.",
    "Поле psuId должно быть положительным целым числом."
  ]
}
```

### Пример ответа с ошибкой 404

```json
{
  "error": "Один или несколько компонентов не найдены.",
  "details": [
    "Процессор с указанным id не найден.",
    "Корпус с указанным id не найден."
  ]
}
```
