const { Router } = require('express');

const router = Router();

router.get('/', (request, response) => {
  response.json({
    ok: true,
    service: 'free-diet-backend',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
