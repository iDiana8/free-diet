const { Router } = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth.middleware');
const { getCatalogPayload } = require('../services/daily.service');
const { createUserProduct } = require('../services/catalog.service');
const { validateCatalogProductPayload } = require('../lib/validation');

const router = Router();

router.get('/', requireAuth, async (request, response) => {
  try {
    const payload = await getCatalogPayload(pool, request.user.id);
    response.json(payload);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error(error);
    return response.status(500).json({ message: 'Не удалось загрузить каталог продуктов' });
  }
});

router.post('/custom', requireAuth, async (request, response) => {
  const payloadError = validateCatalogProductPayload(request.body);

  if (payloadError) {
    return response.status(400).json({ message: payloadError });
  }

  try {
    const product = await createUserProduct(pool, request.user.id, request.body);
    return response.status(201).json({ product });
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error(error);
    return response.status(500).json({ message: 'Не удалось добавить продукт в каталог' });
  }
});

module.exports = router;
