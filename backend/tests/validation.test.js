const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateDate,
  validateDailyPayload,
  validateCatalogProductPayload,
} = require('../src/lib/validation');

test('validateDate returns error for invalid format', () => {
  assert.equal(validateDate('08-04-2026'), 'Дата должна быть в формате YYYY-MM-DD');
});

test('validateDailyPayload accepts valid payload', () => {
  const payload = {
    note: 'Нормальный день по питанию',
    entries: [
      {
        section_key: 'breakfast',
        product_id: 1,
        amount: 120,
      },
    ],
    health_metrics: {
      blood_pressure_systolic: 120,
      blood_pressure_diastolic: 80,
      blood_sugar_level: 5.4,
    },
  };

  assert.equal(validateDailyPayload(payload), '');
});

test('validateDailyPayload blocks invalid amount', () => {
  const payload = {
    note: '',
    entries: [
      {
        section_key: 'drinks',
        product_id: 2,
        amount: 0,
      },
    ],
  };

  assert.equal(
    validateDailyPayload(payload),
    'Запись 1: amount должен быть в диапазоне 1-5000',
  );
});

test('validateCatalogProductPayload accepts valid custom product', () => {
  const payload = {
    section_key: 'snacks',
    name: 'Кленовый пекан',
    calories: 420,
    protein: 6.2,
    fat: 18.4,
    carbs: 47.1,
  };

  assert.equal(validateCatalogProductPayload(payload), '');
});

test('validateCatalogProductPayload requires calories', () => {
  const payload = {
    section_key: 'snacks',
    name: 'Кленовый пекан',
    calories: null,
  };

  assert.equal(validateCatalogProductPayload(payload), 'Калорийность обязательна');
});
