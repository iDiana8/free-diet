# Запуск Free Diet через локальный PostgreSQL 15

## Когда подходит этот сценарий

Используйте этот вариант, если у вас PostgreSQL уже установлен локально через Homebrew и доступна версия `postgresql@15`.

## Что будет происходить

1. запускаем локальный PostgreSQL 15;
2. добавляем его бинарники в `PATH`, чтобы работали команды `createdb` и `psql`;
3. создаём отдельную базу `free_diet`;
4. загружаем в неё таблицы и стартовые данные;
5. запускаем backend;
6. запускаем frontend.

## Шаг 1. Запустить PostgreSQL 15

```bash
brew services start postgresql@15
```

Если сервис уже запущен, Homebrew просто сообщит об этом.

## Шаг 2. Добавить PostgreSQL 15 в PATH

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Это нужно, чтобы терминал находил команды:

- `createdb`
- `psql`
- `pg_ctl`

## Шаг 3. Создать базу данных

```bash
createdb free_diet
```

Если база уже существует, PostgreSQL сообщит об этом. В таком случае можно перейти к следующему шагу.

## Шаг 4. Создать таблицы и стартовые данные

Находясь в корне проекта `free-diet`, выполните:

```bash
psql -d free_diet -f database/init.sql
```

Этот файл создаст:

- `users`
- `nutrition_products`
- `daily_records`
- `daily_entries`

И добавит стартовые продукты для выпадающих списков.

## Шаг 5. Проверить backend env

В файле `backend/.env` должно быть:

```env
DB_NAME=free_diet
```

Остальные значения можно оставить такими:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
CLIENT_URL=http://localhost:5173
AUTH_SECRET=change_me_long_random_secret
```

## Шаг 6. Установить зависимости

Если ещё не делали:

```bash
npm --prefix backend install
npm --prefix frontend install
```

## Шаг 7. Запустить backend

```bash
npm run dev:backend
```

Backend должен стартовать на:

```text
http://localhost:4000
```

## Шаг 8. Запустить frontend

В отдельном терминале:

```bash
npm run dev:frontend
```

Frontend откроется на:

```text
http://localhost:5173
```

## Шаг 9. Открыть сервис

Откройте в браузере:

```text
http://localhost:5173
```

Дальше:

1. зарегистрируйте аккаунт;
2. войдите;
3. выберите дату;
4. начните вести дневник питания.

## Если нужно пересоздать базу с нуля

```bash
dropdb free_diet
createdb free_diet
psql -d free_diet -f database/init.sql
```

Важно: это удалит старые данные из базы `free_diet`.

## Если не хочется менять ~/.zshrc

Можно запускать команды PostgreSQL полным путём:

```bash
/opt/homebrew/opt/postgresql@15/bin/createdb free_diet
/opt/homebrew/opt/postgresql@15/bin/psql -d free_diet -f database/init.sql
```

## Быстрый сценарий целиком

```bash
brew services start postgresql@15
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
createdb free_diet
psql -d free_diet -f database/init.sql
npm run dev:backend
npm run dev:frontend
```
