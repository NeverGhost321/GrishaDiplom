import { expect, test } from '@playwright/test';

test('главная страница и переходы по основным сценариям', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Конфигуратор игровых ПК' }).first()).toBeVisible();

  await expect(page.getByTestId('cta-auto-build')).toBeVisible();
  await expect(page.getByTestId('cta-manual-build')).toBeVisible();
  await expect(page.getByTestId('cta-catalog')).toBeVisible();

  await page.getByTestId('cta-auto-build').click();
  await expect(page).toHaveURL(/\/auto-build$/);

  await page.goto('/');
  await page.getByTestId('cta-manual-build').click();
  await expect(page).toHaveURL(/\/manual-build$/);

  await page.goto('/');
  await page.getByRole('link', { name: 'Сохранённые сборки' }).click();
  await expect(page).toHaveURL(/\/saved-builds$/);

  await page.goto('/');
  await page.getByTestId('cta-catalog').click();
  await expect(page).toHaveURL(/\/(catalog|components)$/);
});

test('каталог комплектующих: загрузка и фильтрация', async ({ page }) => {
  await page.goto('/components');
  await expect(page.getByRole('heading', { name: 'Каталог комплектующих' })).toBeVisible();
  await expect(page.getByText('Найдено элементов:')).toBeVisible();

  await page.getByRole('button', { name: 'Видеокарты' }).click();
  await expect(page.getByRole('button', { name: 'Видеокарты' })).toBeVisible();

  await page.getByPlaceholder('Поиск по модели или производителю').fill('RTX');
  await page.getByRole('button', { name: 'Применить фильтры' }).click();
  await expect(page.getByText('Найдено элементов:')).toBeVisible();
});

test('автоматическая сборка: генерация, результат и сохранение', async ({ page }) => {
  await page.goto('/auto-build');
  await page.getByLabel('Бюджет, ₽').fill('120000');
  await page.getByLabel('Целевое разрешение').selectOption('qhd');
  await page.getByLabel('Приоритет сборки').selectOption('balanced');

  await page.getByRole('button', { name: 'Подобрать сборку' }).click();
  await expect(page.getByText('Рекомендуемая игровая сборка')).toBeVisible();
  await expect(page.getByText('Итоговая стоимость')).toBeVisible();
  await expect(page.getByText('Результат совместимости')).toBeVisible();

  await page.getByRole('button', { name: 'Сохранить сборку' }).click();
  await expect(page.getByText('Сборка успешно сохранена.')).toBeVisible();
});

test('ручная сборка: выбор компонентов, совместимость и сохранение', async ({ page }) => {
  await page.goto('/manual-build');

  const selects = page.locator('select');
  const count = await selects.count();
  for (let i = 0; i < count; i += 1) {
    await selects.nth(i).selectOption({ index: 1 });
  }

  await expect(page.getByText('Результат совместимости')).toBeVisible();

  const saveButton = page.getByRole('button', { name: 'Сохранить сборку' });
  await expect(saveButton).toBeEnabled();
  await saveButton.click();
  await expect(page.getByText('Сборка успешно сохранена.')).toBeVisible();
});

test('сохранённые сборки: просмотр, экспорт и удаление', async ({ page }) => {
  await page.goto('/saved-builds');
  await expect(page.getByRole('heading', { name: 'Сохранённые сборки' })).toBeVisible();

  const openLink = page.getByRole('link', { name: 'Открыть' }).first();
  await expect(openLink).toBeVisible();
  await openLink.click();

  await expect(page).toHaveURL(/\/builds\/\d+$/);
  await expect(page.getByRole('button', { name: 'Экспорт JSON' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Экспорт PDF' })).toBeVisible();

  await page.goto('/saved-builds');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Удалить' }).first().click();
  await expect(page.getByText('успешно удалена')).toBeVisible();
});
