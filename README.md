# Free Diet

Сервис для ведения дневника питания в формате "планшета": пользователь регистрируется, входит в личный аккаунт и сохраняет завтрак, обед, ужин, перекусы, воду, напитки и заметки по дням.

## Что уже есть

- регистрация и вход по `email + password`;
- личный дневник питания, привязанный к аккаунту;
- верхний дашборд по калориям, белкам, жирам, углеводам и воде;
- отдельные блоки: завтрак, обед, ужин, перекусы, вода, напитки;
- заметки по дню с сохранением в базу данных;
- backend API на Node.js + Express;
- PostgreSQL схема и стартовые данные;
- frontend на React + Vite.

## Нужно ли вам вручную создавать таблицы в БД

Да, если вы запускаете PostgreSQL локально без Docker, то базу нужно один раз создать и применить SQL-файл.

Что уже подготовлено:

- файл [database/init.sql](database/init.sql) содержит все нужные таблицы;
- в этом же файле уже есть стартовые продукты для выпадающих списков;
- backend уже настроен на подключение к базе по `backend/.env`.

По умолчанию имя базы уже задано: `free_diet`.

## Какие таблицы создаются

- `users` - пользователи, пароль и личные цели по питанию;
- `nutrition_products` - продукты, вода и напитки для выпадающих списков;
- `daily_records` - запись дня пользователя и заметка;
- `daily_entries` - конкретные продукты по секциям за выбранную дату.

## Как запустить приложение без Docker

### 1. Подготовить env-файлы

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Установить PostgreSQL локально

```bash
brew install postgresql@16
```

### 3. Запустить PostgreSQL

```bash
brew services start postgresql@16
```

### 4. Создать базу данных

```bash
createdb free_diet
```

### 5. Применить схему и стартовые данные

```bash
psql -d free_diet -f database/init.sql
```

### 6. Установить зависимости проекта

```bash
npm --prefix backend install
npm --prefix frontend install
```

### 7. Запустить backend

```bash
npm run dev:backend
```

### 8. Запустить frontend

```bash
npm run dev:frontend
```

### 9. Открыть сайт

```text
http://localhost:5173
```

После открытия сайта:

1. зарегистрируйте аккаунт;
2. войдите в него;
3. выберите дату;
4. начните заполнять питание и заметки.

## Если база уже существовала раньше

Если вы уже запускали старую версию проекта без пользователей, проще всего удалить и заново создать локальную базу:

```bash
dropdb free_diet
createdb free_diet
psql -d free_diet -f database/init.sql
```

Эти команды удалят старые локальные данные этой базы и поднимут чистую схему.

## Переменные окружения backend

Пример файла: [backend/.env.example](backend/.env.example)

Основные поля:

- `PORT=4000`
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`
- `DB_NAME=free_diet`
- `CLIENT_URL=http://localhost:5173`
- `AUTH_SECRET=change_me_long_random_secret`

Для локальной разработки можно оставить эти значения, но `AUTH_SECRET` лучше заменить на длинную случайную строку.

## Docker как запасной вариант

В проекте Docker не обязателен. Он был подготовлен как дополнительный способ запуска PostgreSQL через [docker-compose.yml](docker-compose.yml).

Что в проекте связано с Docker:

- только файл [docker-compose.yml](docker-compose.yml);
- автоматическое выполнение [database/init.sql](database/init.sql) при первом запуске контейнера PostgreSQL.

Что от Docker не зависит:

- весь frontend;
- весь backend;
- схема базы данных;
- API;
- авторизация;
- логика дневника питания.

То есть переход на локальный PostgreSQL не потребовал менять бизнес-логику приложения. Меняется только способ поднятия самой базы.

## Полезные команды

Проверка backend-тестов:

```bash
npm test
```

Сборка frontend:

```bash
npm --prefix frontend run build
```

## Документация

- [Архитектура сервиса](docs/service-architecture.md)
- [Описание API](docs/api.md)
