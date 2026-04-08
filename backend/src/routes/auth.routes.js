const { Router } = require('express');
const pool = require('../db');
const { getConfig } = require('../lib/config');
const { validateAuthPayload, validateLoginPayload } = require('../lib/validation');
const { registerUser, loginUser, getCurrentUser } = require('../services/auth.service');
const { requireAuth } = require('../middleware/auth.middleware');

const config = getConfig();
const router = Router();

router.post('/register', async (request, response) => {
  const payloadError = validateAuthPayload(request.body);

  if (payloadError) {
    return response.status(400).json({ message: payloadError });
  }

  try {
    const payload = await registerUser(pool, request.body, config.authSecret);
    return response.status(201).json(payload);
  } catch (error) {
    if (error.code === '23505') {
      return response.status(409).json({ message: 'Пользователь с таким email уже существует' });
    }

    console.error(error);
    return response.status(500).json({ message: 'Не удалось зарегистрировать пользователя' });
  }
});

router.post('/login', async (request, response) => {
  const payloadError = validateLoginPayload(request.body);

  if (payloadError) {
    return response.status(400).json({ message: payloadError });
  }

  try {
    const payload = await loginUser(pool, request.body, config.authSecret);

    if (!payload) {
      return response.status(401).json({ message: 'Неверный email или пароль' });
    }

    return response.json(payload);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Не удалось выполнить вход' });
  }
});

router.get('/me', requireAuth, async (request, response) => {
  try {
    const user = await getCurrentUser(pool, request.user.id);

    if (!user) {
      return response.status(404).json({ message: 'Пользователь не найден' });
    }

    return response.json({ user });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Не удалось загрузить пользователя' });
  }
});

module.exports = router;
