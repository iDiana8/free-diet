# `src/services/daily.service.js`

## Что это
Сервис дневника питания за конкретную дату.

## Что там написано
Ключевые функции:
- `getDailyPayload(pool, userId, date)` — собирает данные дня (entries, note, health_metrics, dashboard).
- `saveDailyPayload(pool, userId, date, payload)` — сохраняет дневник в транзакции и возвращает обновленный payload.
- `getCatalogPayload(pool, userId)` — данные каталога для экрана добавления.

Внутренние шаги:
- читает targets пользователя,
- читает/создает daily_record,
- сохраняет entries,
- upsert health metrics,
- проверяет соответствие продукта секции,
- делегирует расчеты в `nutrition.service.js`.

## Почему так пишут
- Это крупный use-case; ему нужен отдельный модуль.
- Транзакция защищает целостность данных.

## С чем связано
- `services/catalog.service.js` (каталог).
- `services/nutrition.service.js` (математика).
- `lib/errors.js` (бизнес-ошибки).
- Таблицы `daily_records`, `daily_entries`, `daily_health_metrics`, `users`.

## На что влияет
- На корректность дневника и расчетов dashboard.

## Что будет, если файла не будет
- Пропадет ключевой функционал "получить/сохранить день".

## Тезисно
- `daily.service.js` = оркестратор доменного сценария дня.
