const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeProductName,
  buildProductConfigBySection,
} = require('../src/lib/product-catalog');

test('normalizeProductName removes noisy characters and normalizes ё', () => {
  assert.equal(
    normalizeProductName('  Йогурт "Ёжик" 5%  '),
    'йогурт ежик 5%',
  );
});

test('buildProductConfigBySection returns water settings for water block', () => {
  assert.deepEqual(buildProductConfigBySection('water'), {
    product_kind: 'water',
    unit_label: 'мл',
    allowed_sections: ['water'],
  });
});
