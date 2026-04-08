const { getConfig } = require('../lib/config');
const { verifyToken } = require('../lib/crypto');

const config = getConfig();

function requireAuth(request, response, next) {
  const authorizationHeader = request.headers.authorization || '';
  const token = authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice('Bearer '.length)
    : '';

  const payload = verifyToken(token, config.authSecret);

  if (!payload || !Number.isInteger(payload.user_id)) {
    return response.status(401).json({ message: 'Нужна авторизация' });
  }

  request.user = {
    id: payload.user_id,
    email: payload.email,
    name: payload.name,
  };

  return next();
}

module.exports = {
  requireAuth,
};
