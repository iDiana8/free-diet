const test = require('node:test');
const assert = require('node:assert/strict');
const { createPasswordSalt, hashPassword, createToken, verifyToken } = require('../src/lib/crypto');
const {
  validateAuthPayload,
  validateLoginPayload,
  validateProfilePayload,
  validateHealthMetrics,
} = require('../src/lib/validation');

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

test('validateProfilePayload accepts profile numbers', () => {
  const error = validateProfilePayload({
    height_cm: 170,
    weight_kg: 68.5,
    age_years: 29,
  });

  assert.equal(error, '');
});

test('validateHealthMetrics blocks invalid blood sugar', () => {
  const error = validateHealthMetrics({
    blood_pressure_systolic: 120,
    blood_pressure_diastolic: 80,
    blood_sugar_level: 99,
  });

  assert.equal(error, 'Уровень сахара должен быть числом от 1 до 40');
});
