const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateEntryNutrition,
  buildSummary,
  buildDashboard,
} = require('../src/services/nutrition.service');

const productsById = {
  1: {
    id: 1,
    name: 'Овсянка',
    product_kind: 'food',
    unit_label: 'г',
    base_amount: 100,
    calories: 350,
    protein: 12,
    fat: 6,
    carbs: 58,
  },
  2: {
    id: 2,
    name: 'Вода',
    product_kind: 'water',
    unit_label: 'мл',
    base_amount: 100,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  },
};

test('calculateEntryNutrition returns scaled nutrition values', () => {
  const nutrition = calculateEntryNutrition(productsById[1], 150);

  assert.deepEqual(nutrition, {
    calories: 525,
    protein: 18,
    fat: 9,
    carbs: 87,
    water_ml: 0,
  });
});

test('buildSummary aggregates food and water separately', () => {
  const summary = buildSummary(
    [
      { product_id: 1, amount: 100 },
      { product_id: 2, amount: 250 },
    ],
    productsById,
  );

  assert.deepEqual(summary, {
    calories: 350,
    protein: 12,
    fat: 6,
    carbs: 58,
    water_ml: 250,
  });
});

test('buildDashboard calculates balances and progress', () => {
  const dashboard = buildDashboard(
    [{ product_id: 1, amount: 100 }],
    productsById,
    {
      calories: 500,
      protein: 10,
      fat: 10,
      carbs: 100,
      water_ml: 1000,
    },
  );

  assert.equal(dashboard.summary.calories, 350);
  assert.equal(dashboard.balances.calories, -150);
  assert.equal(dashboard.progress.calories, 70);
});
