const test = require('node:test');
const assert = require('node:assert/strict');
const { createPasswordSalt, hashPassword, createToken, verifyToken } = require('../src/lib/crypto');
const { validateAuthPayload, validateLoginPayload } = require('../src/lib/validation');

test('hashPassword returns deterministic hash for same salt', () => {
  const salt = createPasswordSalt();
  const hashA = hashPassword('strong-password', salt);
  const hashB = hashPassword('strong-password', salt);

  assert.equal(hashA, hashB);
});

test('verifyToken returns payload for valid token', () => {
  const token = createToken({ user_id: 7, email: 'test@example.com', name: 'Test' }, 'secret');
  const payload = verifyToken(token, 'secret');

  assert.deepEqual(payload, {
    user_id: 7,
    email: 'test@example.com',
    name: 'Test',
  });
});

test('validateAuthPayload blocks invalid email', () => {
  const error = validateAuthPayload({
    name: 'Diana',
    email: 'wrong-email',
    password: '123456',
  });

  assert.equal(error, 'Email должен быть валидным адресом');
});

test('validateLoginPayload accepts valid payload', () => {
  const error = validateLoginPayload({
    email: 'diana@example.com',
    password: '123456',
  });

  assert.equal(error, '');
});
