# API сервиса Free Diet

## GET `/api/health`

Проверка доступности backend.

## POST `/api/auth/register`

Регистрация пользователя.

### Тело запроса

```json
{
  "name": "Diana",
  "email": "diana@example.com",
  "password": "123456"
}
```

## POST `/api/auth/login`

Вход пользователя.

### Тело запроса

```json
{
  "email": "diana@example.com",
  "password": "123456"
}
```

## GET `/api/auth/me`

Возвращает текущего пользователя.

### Заголовок

```text
Authorization: Bearer <token>
```

## GET `/api/daily/:date`

Возвращает личный дневник питания за дату `YYYY-MM-DD`.

## GET `/api/catalog`

Возвращает каталог продуктов пользователя:

- общий каталог, собранный из PDF;
- пользовательские продукты, которые человек добавил сам.

## POST `/api/catalog/custom`

Добавляет пользовательский продукт в каталог.

### Тело запроса

```json
{
  "section_key": "snacks",
  "name": "Кленовый пекан",
  "calories": 420,
  "protein": 6.2,
  "fat": 18.4,
  "carbs": 47.1
}
```

## PUT `/api/daily/:date`

Сохраняет личный дневник питания за дату.

### Тело запроса

```json
{
  "note": "Сегодня нужно добрать воду",
  "entries": [
    {
      "section_key": "breakfast",
      "product_id": 1,
      "amount": 180
    },
    {
      "section_key": "water",
      "product_id": 11,
      "amount": 400
    }
  ]
}
```

## Валидация

- имя: от 2 до 80 символов;
- email: валидный email;
- пароль: от 6 до 120 символов;
- дата: `YYYY-MM-DD`;
- `amount`: от 1 до 5000;
- название нового продукта: от 2 до 120 символов;
- калорийность нового продукта: от 0 до 5000;
- белки, жиры и углеводы нового продукта: от 0 до 500.
