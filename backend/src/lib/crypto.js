const crypto = require('crypto');

function createPasswordSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function createToken(payload, secret) {
  const serializedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(serializedPayload).digest('base64url');

  return `${serializedPayload}.${signature}`;
}

function verifyToken(token, secret) {
  if (typeof token !== 'string') {
    return null;
  }

  const [serializedPayload, signature] = token.split('.');

  if (!serializedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(serializedPayload).digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(serializedPayload, 'base64url').toString('utf8'));
    return payload;
  } catch (error) {
    return null;
  }
}

module.exports = {
  createPasswordSalt,
  hashPassword,
  createToken,
  verifyToken,
};
