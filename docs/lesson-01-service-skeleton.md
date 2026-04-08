# Урок 1. Каркас сервиса: React + Node.js + PostgreSQL

## Зачем нам каркас
Каркас нужен, чтобы у тебя была **рабочая база**, куда потом можно добавлять любой функционал (авторизацию, профили, платежи, аналитику и т.д.) и сразу видеть результат на фронте.

В реальных командах обычно делают так:
1. Поднимают `frontend` (UI).
2. Поднимают `backend` (API + бизнес-логика).
3. Подключают `database` (хранение данных).
4. Проверяют полный цикл: кнопка на фронте -> запрос в API -> запись/чтение из БД -> ответ обратно на экран.

---

## Как всё связано между собой

- **Frontend (React)**: показывает интерфейс, ловит клики пользователя, отправляет HTTP-запросы.
- **Backend (Node.js + Express)**: принимает запросы, валидирует данные, выполняет бизнес-логику, работает с БД.
- **PostgreSQL**: хранит данные в таблицах.

Поток запроса:
1. Пользователь нажимает кнопку `Загрузить пользователей`.
2. React делает `GET /api/users`.
3. Express получает запрос и выполняет SQL в PostgreSQL.
4. Бэк возвращает JSON.
5. React рисует данные на экране.

---

## Рекомендуемая структура проекта

```text
free-diet/
  backend/
    src/
      index.js
      app.js
      db.js
      routes/
        health.routes.js
        users.routes.js
    .env
    package.json
  frontend/
    src/
      main.jsx
      App.jsx
      api/
        client.js
    package.json
    vite.config.js
  docs/
    lesson-01-service-skeleton.md
    interview-definitions.md
    it-english-vocabulary.md
  .gitignore
  README.md
```

---

## Шаг 1. Инициализация backend

### 1) Создай проект и зависимости
```bash
mkdir backend && cd backend
npm init -y
npm i express cors dotenv pg
npm i -D nodemon
```

### 2) Скрипты в `backend/package.json`
```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

### 3) `backend/src/db.js`
```js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;
```

### 4) `backend/src/app.js`
```js
const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const usersRoutes = require('./routes/users.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/users', usersRoutes);

module.exports = app;
```

### 5) `backend/src/index.js`
```js
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API started on http://localhost:${PORT}`);
});
```

### 6) `backend/src/routes/health.routes.js`
```js
const { Router } = require('express');

const router = Router();

router.get('/', (_, res) => {
  res.json({ ok: true, service: 'backend', ts: new Date().toISOString() });
});

module.exports = router;
```

### 7) `backend/src/routes/users.routes.js`
```js
const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.get('/', async (_, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users ORDER BY id DESC LIMIT 20');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
```

### 8) `backend/.env`
```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=free_diet
```

---

## Шаг 2. PostgreSQL (минимум для старта)

```sql
CREATE DATABASE free_diet;

\c free_diet;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (name, email)
VALUES ('Diana', 'diana@example.com');
```

---

## Шаг 3. Инициализация frontend (React + Vite)

```bash
cd ..
npm create vite@latest frontend -- --template react
cd frontend
npm i
```

### 1) `frontend/src/api/client.js`
```js
const API_URL = 'http://localhost:4000/api';

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}
```

### 2) `frontend/src/App.jsx`
```jsx
import { useState } from 'react';
import { getUsers } from './api/client';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Free Diet: Learning Skeleton</h1>
      <button onClick={loadUsers} disabled={loading}>
        {loading ? 'Loading...' : 'Load users'}
      </button>

      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}

      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name} ({u.email})</li>
        ))}
      </ul>
    </main>
  );
}

export default App;
```

---

## Шаг 4. Как запускать всё вместе

Окно терминала №1:
```bash
cd backend
npm run dev
```

Окно терминала №2:
```bash
cd frontend
npm run dev
```

Проверка:
1. Открой фронт (обычно `http://localhost:5173`).
2. Нажми `Load users`.
3. Если всё верно, увидишь данные из PostgreSQL.

---

## Зачем фронтенд отправляет запросы на сервер

Фронтенд не должен напрямую общаться с БД (это небезопасно и ломает архитектуру).

Причины, почему нужен backend:
1. Безопасность: токены, права доступа, проверка данных.
2. Бизнес-логика: правила приложения должны жить централизованно.
3. Контроль доступа к БД: SQL и секреты только на сервере.
4. Масштабирование: один API обслуживает web, mobile, admin panel.

---

## Что изучать дальше после этого урока

1. HTTP: методы `GET/POST/PUT/PATCH/DELETE`, коды ответов.
2. REST API: маршруты, ресурсы, валидация.
3. SQL: `SELECT`, `JOIN`, индексы, транзакции.
4. React: компоненты, state, effects, формы.
5. Ошибки и логирование: как отлаживать.
6. Базовая безопасность: `hash password`, `JWT`, CORS, env-переменные.

---

## Практика на закрепление

1. Добавь на бэке `POST /api/users`.
2. Сделай форму на фронте: имя + email.
3. После создания пользователя обновляй список.
4. Покажи сообщение об успехе и сообщение об ошибке.

Если хочешь, во втором уроке сделаем это вместе и разберем каждый шаг, как на реальном проекте в команде.
