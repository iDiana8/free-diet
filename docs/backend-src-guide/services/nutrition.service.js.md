# `src/services/nutrition.service.js`

## Что это
Сервис чистых функций расчета нутриентов и метрик dashboard.

## Что там написано
Функции:
- `calculateEntryNutrition(product, amount)`
- `createEmptyEntriesMap()`
- `buildSummary(entries, productsById)`
- `groupEntries(entries, productsById)`
- `buildDashboard(entries, productsById, dbTargets)`

Ключевая идея:
- Математика отделена от БД и HTTP.

## Почему так пишут
- Pure-функции проще тестировать.
- Поведение предсказуемо и переиспользуемо.

## С чем связано
- Использует `lib/constants.js`.
- Вызывается из `daily.service.js`.
- Тестируется в `tests/nutrition.service.test.js`.

## На что влияет
- На точность калорий/БЖУ/воды.
- На правильный прогресс и балансы в UI.

## Что будет, если файла не будет
- Dashboard или не соберется, или будет с некорректной логикой.

## Тезисно
- Это вычислительное ядро продукта.
