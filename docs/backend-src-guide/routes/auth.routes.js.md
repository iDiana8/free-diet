# `src/routes/auth.routes.js`

## Что это
Маршруты регистрации, входа и профиля пользователя.

## Что там написано
Основные endpoint:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (с `requireAuth`)
- `PUT /api/auth/me` (с `requireAuth`)

Логика:
- Валидация payload через `lib/validation.js`.
- Вызов сервисов `auth.service.js`.
- Обработка ошибок (включая `409` для дубликата email).

## Почему так пишут
- Route слой контролирует HTTP-аспекты.
- Auth-бизнес-логика находится в service, не в route.

## С чем связано
- `db.js`, `lib/config.js`, `lib/validation.js`, `services/auth.service.js`, `middleware/auth.middleware.js`.

## На что влияет
- На UX регистрации/логина.
- На безопасность доступа к профилю.

## Что будет, если файла не будет
- Пользователь не сможет зарегистрироваться, войти и получить профиль.

## Тезисно
- Это точка входа всей пользовательской auth-цепочки.
