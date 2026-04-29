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

## Автоматический подбор сборки

Добавлен `BuildGeneratorService` (`src/services/build-generator.service.ts`) с функцией `generateBuild(params, componentsPool)` для автоматического подбора игровой конфигурации.

### Входные параметры

- `budget: number` — максимальный бюджет сборки;
- `targetResolution: "fullhd" | "qhd" | "uhd"` — целевое разрешение;
- `priority: "performance" | "balanced" | "budget" | "reliability" | "upgrade"` — приоритет пользователя;
- `preferredBrands?: string[]` — бренды с мягким бонусом при scoring;
- `excludedBrands?: string[]` — бренды, которые исключаются из пула кандидатов.

### Общий алгоритм

1. Фильтрация пула по `excludedBrands` (с учётом `brand`, `manufacturer`, `gpuManufacturer`, `boardManufacturer`).
2. Эвристическое распределение бюджета по категориям (GPU/CPU/MB/RAM/PSU/Storage/Case/Cooler).
3. Выбор топ-кандидатов GPU под целевое разрешение.
4. Подбор CPU соответствующего уровня, затем материнской платы, RAM, SSD, PSU, корпуса и кулера.
5. Проверка каждой комбинации через `CompatibilityService` (`checkCompatibility`).
6. Расчёт `buildScore` с учётом совместимости, производительности, цены, надёжности, приоритета, preferred-брендов и warning-штрафов.
7. Возврат лучшей совместимой сборки или `null`, если подходящий вариант не найден.

### Критерии scoring

- `compatibilityScore` из результата совместимости;
- производительность пары CPU/GPU;
- соответствие бюджету (разные акценты для `performance` и `budget`);
- показатели надёжности (в т.ч. `psu.reliabilityScore`, `motherboard.vrmQualityScore`);
- бонусы для `upgrade`-ориентированных платформ (DDR5, AM5/LGA1700, PCIe 4.0+);
- бонусы preferred-брендов;
- штраф за warnings.

Сервис также формирует:
- `explanation` на русском языке;
- `alternatives` с альтернативными GPU/CPU/RAM/PSU.

## API автоматического подбора

Добавлен endpoint для автоматического подбора совместимой игровой сборки:

- `POST /api/builds/generate`

### Пример запроса

```http
POST /api/builds/generate
Content-Type: application/json
```

```json
{
  "budget": 120000,
  "targetResolution": "qhd",
  "priority": "balanced",
  "preferredBrands": ["AMD", "MSI"],
  "excludedBrands": ["Palit"]
}
```

### Пример успешного ответа

```json
{
  "result": {
    "components": {
      "cpu": {},
      "motherboard": {},
      "ram": {},
      "gpu": {},
      "psu": {},
      "storage": {},
      "pcCase": {},
      "cooler": {}
    },
    "totalPrice": 118500,
    "compatibilityResult": {
      "isCompatible": true,
      "errors": [],
      "warnings": [],
      "recommendations": [],
      "totalPowerConsumption": 390,
      "requiredPsuWattage": 468,
      "totalPrice": 118500,
      "compatibilityScore": 93
    },
    "performanceScore": 86,
    "explanation": "Сборка выбрана под 2K (QHD) с приоритетом «balanced». ...",
    "alternatives": []
  }
}
```

### Пример ответа 400

```json
{
  "error": "Некорректные параметры автоподбора.",
  "details": [
    "Поле budget должно быть числом.",
    "Поле targetResolution должно быть одним из: fullhd, qhd, uhd."
  ]
}
```

### Пример ответа 404

```json
{
  "error": "Не удалось подобрать совместимую сборку под заданные параметры.",
  "recommendations": [
    "Увеличьте бюджет.",
    "Измените приоритет сборки.",
    "Уберите часть ограничений по брендам."
  ]
}
```

## API сохранённых сборок

Добавлены endpoint'ы для сохранения, просмотра, удаления и экспорта пользовательских сборок.

- `GET /api/builds`
- `POST /api/builds`
- `DELETE /api/builds/:id`
- `GET /api/builds/:id/export`

### GET /api/builds

Возвращает список сохранённых сборок (с компонентами), отсортированный по дате создания (новые сверху).

Пример ответа:

```json
{
  "items": [],
  "count": 0
}
```

### POST /api/builds

Сохраняет сборку после валидации и проверки совместимости.

Пример запроса:

```json
{
  "name": "Сбалансированная сборка для 2K",
  "budget": 120000,
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

Пример успешного ответа (`201`):

```json
{
  "item": {
    "id": 1,
    "name": "Сбалансированная сборка для 2K"
  },
  "compatibilityResult": {
    "isCompatible": true,
    "errors": [],
    "warnings": []
  }
}
```

Если есть критические ошибки совместимости (`compatibilityResult.errors`), сборка **не сохраняется** и возвращается `400`.

### DELETE /api/builds/:id

Удаляет сохранённую сборку по ID.

Пример ответа:

```json
{
  "message": "Сборка успешно удалена."
}
```

### GET /api/builds/:id/export

Возвращает JSON-экспорт сборки с пересчитанным `compatibilityResult` и заголовком `Content-Disposition` для скачивания файла `pc-build-{id}.json`.

Пример ответа:

```json
{
  "project": "Конфигуратор игровых ПК",
  "exportedAt": "2026-04-29T00:00:00.000Z",
  "build": {
    "name": "Сбалансированная сборка для 2K",
    "budget": 120000,
    "totalPrice": 118500,
    "createdAt": "2026-04-29T00:00:00.000Z",
    "components": {
      "cpu": {},
      "motherboard": {},
      "ram": {},
      "gpu": {},
      "psu": {},
      "storage": {},
      "pcCase": {},
      "cooler": {}
    },
    "compatibilityResult": {}
  }
}
```

## Пользовательский интерфейс

Интерфейс приложения выполнен в тёмной теме, адаптивен и ориентирован на демонстрацию практической части ВКР.

### Основные страницы

- `/` — Главная (hero-блок, переход к автоподбору и ручной сборке, описание проверок совместимости);
- `/auto-build` — Автоподбор (временная страница-заглушка для следующего этапа);
- `/manual-build` — Ручная сборка (временная страница-заглушка);
- `/catalog` — Каталог комплектующих (временная страница-заглушка);
- `/saved-builds` — Сохранённые сборки (временная страница-заглушка);
- `/about` — О проекте (временная страница-заглушка).

Верхнее меню навигации доступно на всех страницах и подсвечивает активный маршрут.

### Переиспользуемые UI-компоненты

Добавлены базовые UI-компоненты в `src/components/ui`:

- `Button` — кнопка с вариантами `primary`, `secondary`, `danger`, `ghost`;
- `Card` — универсальная карточка контента;
- `Badge` — цветные бейджи статусов;
- `Alert` — информационные/предупреждающие блоки;
- `ProgressBar` — прогресс-бар для метрик и score;
- `ComponentCard` — карточка комплектующего (название, цена, характеристики);
- `CompatibilityPanel` — панель результата совместимости (`CompatibilityResult`).

## Страница автоподбора

Добавлена полноценная страница `/auto-build` для автоматического подбора игровой конфигурации через `POST /api/builds/generate`.

### Что вводит пользователь

- Бюджет (минимум 30 000 ₽, по умолчанию 120 000 ₽);
- Целевое разрешение: Full HD / 2K (1440p) / 4K;
- Приоритет: balanced / performance / budget / reliability / upgrade;
- Предпочитаемые бренды (через запятую);
- Исключённые бренды (через запятую).

### Что отображается в результате

- Сводка по сборке: итоговая цена, совместимость, производительность, энергопотребление, рекомендуемая мощность БП, выбранные разрешение и приоритет;
- Карточки компонентов: CPU, Motherboard, RAM, GPU, PSU, Storage, Case, Cooler;
- Панель совместимости (`CompatibilityPanel`) с ошибками, предупреждениями и рекомендациями;
- Блок объяснения выбора: «Почему выбрана эта сборка»;
- Блок «Альтернативные варианты» (если есть данные от генератора).

### Дополнительные действия

- **Сохранить сборку** — отправка в `POST /api/builds` с автоматическим именем и id выбранных компонентов;
- **Экспортировать JSON** — локальная выгрузка текущего результата автоподбора в файл `pc-auto-build.json` без необходимости предварительного сохранения в БД.
