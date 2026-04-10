const { Router } = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateDate, validateDailyPayload } = require('../lib/validation');
const { getDailyPayload, saveDailyPayload } = require('../services/daily.service');

const router = Router();

router.get('/:date', requireAuth, async (request, response) => {
  const dateError = validateDate(request.params.date);

  if (dateError) {
    return response.status(400).json({ message: dateError });
  }

  try {
    const payload = await getDailyPayload(pool, request.user.id, request.params.date);
    return response.json(payload);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error(error);
    return response.status(500).json({ message: 'Не удалось загрузить дневник питания' });
  }
});

router.put('/:date', requireAuth, async (request, response) => {
  const dateError = validateDate(request.params.date);

  if (dateError) {
    return response.status(400).json({ message: dateError });
  }

  const payloadError = validateDailyPayload(request.body);

  if (payloadError) {
    return response.status(400).json({ message: payloadError });
  }

  try {
    const payload = await saveDailyPayload(pool, request.user.id, request.params.date, request.body);
    return response.json(payload);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error(error);
    return response.status(500).json({ message: 'Не удалось сохранить дневник питания' });
  }
});

module.exports = router;
