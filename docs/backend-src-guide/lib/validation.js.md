# `src/lib/validation.js`

## Что это
Центральная валидация входных данных API.

## Что там написано
Ключевые функции:
- `validateDate`
- `validateDailyPayload`
- `validateAuthPayload`
- `validateLoginPayload`
- `validateProfilePayload`
- `validateHealthMetrics`
- `validateCatalogProductPayload`

Также есть внутренние helpers (`isPlainObject`, `validateOptionalNumber`, `validateEntry`).

## Почему так пишут
- Валидировать вход лучше до обращения к БД и до бизнес-логики.
- Единое место правил облегчает сопровождение и тестирование.

## С чем связано
- Используется в `routes/auth.routes.js`, `routes/daily.routes.js`, `routes/catalog.routes.js`.

## На что влияет
- На стабильность API.
- На качество ошибок для клиента.
- На защиту БД от некорректных данных.

## Что будет, если файла не будет
- Много невалидных payload попадут в сервисы и SQL, вырастут 500-ошибки.

## Тезисно
- `validation.js` = "входной фильтр" backend.
