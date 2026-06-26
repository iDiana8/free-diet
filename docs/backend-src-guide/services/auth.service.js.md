# `src/services/auth.service.js`

## Что это
Бизнес-логика аутентификации и профиля пользователя.

## Что там написано
Ключевые функции:
- `registerUser(pool, payload, authSecret)`
- `loginUser(pool, payload, authSecret)`
- `getCurrentUser(pool, userId)`
- `updateCurrentUser(pool, userId, payload)`

Важные детали:
- email нормализуется (`trim + lowerCase`).
- пароль хранится как hash+salt.
- ответ auth содержит `token` и нормализованного `user`.

## Почему так пишут
- Безопасность и консистентность пользователя централизованы в одном модуле.
- Routes не должны знать детали hashing/token.

## С чем связано
- `lib/crypto.js`.
- Таблица `users` в PostgreSQL.
- `routes/auth.routes.js`.

## На что влияет
- На вход пользователя, сохранность credentials и формат user-данных.

## Что будет, если файла не будет
- Не будет корректной регистрации/логина/профиля.

## Тезисно
- `auth.service.js` управляет жизненным циклом учетной записи в API.
