# `src/routes/catalog.routes.js`

## Что это
Маршруты каталога продуктов пользователя.

## Что там написано
Endpoint:
- `GET /api/catalog/` — получить каталог и targets.
- `POST /api/catalog/custom` — добавить пользовательский продукт.

Логика:
- Оба endpoint защищены `requireAuth`.
- Для `custom` есть валидация через `validateCatalogProductPayload`.
- Используются сервисы `daily.service.js` (получение payload каталога) и `catalog.service.js` (создание продукта).

## Почему так пишут
- Каталог — отдельный use-case, отделен от дневника.
- Проверки входа находятся до вызова SQL.

## С чем связано
- `db.js`, `middleware/auth.middleware.js`, `lib/validation.js`, `services/daily.service.js`, `services/catalog.service.js`.

## На что влияет
- На полноту и персонализацию каталога.

## Что будет, если файла не будет
- Нельзя посмотреть доступные продукты и добавить custom-позиции.

## Тезисно
- `catalog.routes.js` управляет внешним API для справочника питания.
