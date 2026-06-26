# backend/src: архитектурная карта (таблица)

## Как читать таблицу
- `Слой`: место файла в архитектуре.
- `Связи`: что вызывает и кем вызывается.
- `Если убрать`: какой эффект/поломка.

| Путь | Слой | Что делает | Связи | Если убрать файл |
|---|---|---|---|---|
| `src/index.js` | Bootstrap | Точка входа, поднимает сервер и синхронизирует каталог | Использует `app.js`, `db.js`, `lib/config.js`, `services/catalog.service.js` | Сервер не стартует |
| `src/app.js` | HTTP composition | Собирает Express app, middleware и маршруты | Подключает `routes/*`, `lib/config.js` | Не будет маршрутизации API |
| `src/db.js` | Infrastructure | Создает `pg.Pool` по ENV-конфигу | Использует `lib/config.js`, импортируется в routes/services | Нет доступа к PostgreSQL |
| `src/data/nutrition-products.json` | Data seed | Базовый справочник продуктов и нутриентов | Читается в `services/catalog.service.js` | Пустой/бедный каталог при инициализации |
| `src/lib/config.js` | Shared lib | Загружает `.env`, валидирует и возвращает конфиг | Используется в `index.js`, `app.js`, `db.js`, `middleware/auth.middleware.js`, `routes/auth.routes.js` | Ошибки конфигурации, хардкод, нестабильный запуск |
| `src/lib/constants.js` | Shared lib | Секции питания и дефолтные цели | Используется в `lib/validation.js`, `services/nutrition.service.js` | Дублирование констант и рассинхрон правил |
| `src/lib/crypto.js` | Security lib | Хеш паролей и подпись токенов | Используется в `services/auth.service.js`, `middleware/auth.middleware.js` | Нельзя безопасно логинить и авторизовывать |
| `src/lib/errors.js` | Error model | Создает ошибки с `statusCode` | Используется в `services/catalog.service.js`, `services/daily.service.js` | Сложнее отдавать корректные 4xx-ошибки |
| `src/lib/product-catalog.js` | Domain lib | Нормализация названий и правила типов продуктов | Используется в `services/catalog.service.js` | Дубли, неконсистентные правила секций |
| `src/lib/validation.js` | Input validation | Проверки payload для дат, auth, daily, profile, catalog | Вызывается из `routes/auth.routes.js`, `routes/daily.routes.js`, `routes/catalog.routes.js` | Мусорные данные попадут в бизнес-логику/БД |
| `src/middleware/auth.middleware.js` | HTTP middleware | Проверка Bearer-token, заполнение `request.user` | Использует `lib/config.js`, `lib/crypto.js`; применяется в routes | Защищенные API станут публичными |
| `src/routes/health.routes.js` | Route | Health endpoint для проверки живости | Подключается в `app.js` | Нет endpoint мониторинга |
| `src/routes/auth.routes.js` | Route | Регистрация, логин, чтение/обновление профиля | Использует `db.js`, `lib/validation.js`, `services/auth.service.js`, `middleware/auth.middleware.js` | Нет auth и профиля |
| `src/routes/catalog.routes.js` | Route | Получение каталога и добавление custom-продукта | Использует `db.js`, `middleware/auth.middleware.js`, `services/daily.service.js`, `services/catalog.service.js`, `lib/validation.js` | Нет работы с каталогом |
| `src/routes/daily.routes.js` | Route | Чтение/сохранение дневника за дату | Использует `db.js`, `middleware/auth.middleware.js`, `lib/validation.js`, `services/daily.service.js` | Нет основного сценария дневника |
| `src/services/auth.service.js` | Service | Бизнес-логика auth и профиля, нормализация user | Использует `lib/crypto.js`, БД через `pool` | Ломаются register/login/me/update |
| `src/services/catalog.service.js` | Service | Синхронизация seed-каталога и добавление пользовательских продуктов | Использует `data/*.json`, `lib/product-catalog.js`, `lib/errors.js`, БД | Каталог не инициализируется, дубли продуктов |
| `src/services/daily.service.js` | Service | Агрегация payload дня, транзакционное сохранение записей | Использует `services/nutrition.service.js`, `services/catalog.service.js`, `lib/errors.js`, БД | Нельзя читать/сохранять дневник |
| `src/services/nutrition.service.js` | Pure domain service | Расчет нутриентов, summary/targets/balances/progress | Использует `lib/constants.js`, вызывается `daily.service.js` | Некорректные/отсутствующие расчеты dashboard |

## Поток запроса (в 1 строку)
`Client -> app.js -> routes/* -> validation/auth middleware -> services/* -> PostgreSQL + lib -> JSON response`
