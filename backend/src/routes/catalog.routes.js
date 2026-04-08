const { Router } = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth.middleware');
const { getCatalogPayload } = require('../services/daily.service');

const router = Router();

router.get('/', requireAuth, async (request, response) => {
  try {
    const payload = await getCatalogPayload(pool, request.user.id);
    response.json(payload);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: 'Не удалось загрузить каталог продуктов' });
  }
});

module.exports = router;
