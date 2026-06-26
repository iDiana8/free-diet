# backend/src study guide

## Быстрый старт
1. Открой таблицу архитектуры: `00-src-architecture-table.md`.
2. Пройди обзор папок: `root/root.md`, `data/data.md`, `lib/lib.md`, `middleware/middleware.md`, `routes/routes.md`, `services/services.md`.
3. Затем читай файлы поштучно в каждой папке.

## Содержание
- `00-src-architecture-table.md` — единая таблица по всем файлам `src`.
- `root/` — разбор `index.js`, `app.js`, `db.js`.
- `data/` — обзор и детальный разбор `nutrition-products.json`.
- `lib/` — обзор + отдельные файлы по каждому модулю.
- `middleware/` — обзор + `auth.middleware.js`.
- `routes/` — обзор + каждый route-файл.
- `services/` — обзор + каждый service-файл.

## Как учить эффективно
- Иди сверху вниз: `index.js -> app.js -> routes -> services -> lib/data`.
- После каждого файла отвечай себе на 4 вопроса:
  - Что делает?
  - Зачем нужен?
  - С чем связан?
  - Что сломается без него?
