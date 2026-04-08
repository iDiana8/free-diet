const { DEFAULT_TARGETS, SECTION_KEYS } = require('../lib/constants');

function roundValue(value) {
  return Math.round(value * 10) / 10;
}

function createEmptySummary() {
  return {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    water_ml: 0,
  };
}

function createEmptyEntriesMap() {
  const result = {};

  for (const sectionKey of SECTION_KEYS) {
    result[sectionKey] = [];
  }

  return result;
}

function calculateEntryNutrition(product, amount) {
  const factor = amount / product.base_amount;

  return {
    calories: roundValue(product.calories * factor),
    protein: roundValue(product.protein * factor),
    fat: roundValue(product.fat * factor),
    carbs: roundValue(product.carbs * factor),
    water_ml: product.product_kind === 'water' ? roundValue(amount) : 0,
  };
}

function buildSummary(entries, productsById) {
  const summary = createEmptySummary();

  for (const entry of entries) {
    const product = productsById[entry.product_id];

    if (!product) {
      continue;
    }

    const entryNutrition = calculateEntryNutrition(product, entry.amount);

    summary.calories += entryNutrition.calories;
    summary.protein += entryNutrition.protein;
    summary.fat += entryNutrition.fat;
    summary.carbs += entryNutrition.carbs;
    summary.water_ml += entryNutrition.water_ml;
  }

  return {
    calories: roundValue(summary.calories),
    protein: roundValue(summary.protein),
    fat: roundValue(summary.fat),
    carbs: roundValue(summary.carbs),
    water_ml: roundValue(summary.water_ml),
  };
}

function buildBalances(summary, targets) {
  return {
    calories: roundValue(summary.calories - targets.calories),
    protein: roundValue(summary.protein - targets.protein),
    fat: roundValue(summary.fat - targets.fat),
    carbs: roundValue(summary.carbs - targets.carbs),
    water_ml: roundValue(summary.water_ml - targets.water_ml),
  };
}

function buildProgress(summary, targets) {
  return {
    calories: roundValue(Math.min((summary.calories / targets.calories) * 100, 999)),
    protein: roundValue(Math.min((summary.protein / targets.protein) * 100, 999)),
    fat: roundValue(Math.min((summary.fat / targets.fat) * 100, 999)),
    carbs: roundValue(Math.min((summary.carbs / targets.carbs) * 100, 999)),
    water_ml: roundValue(Math.min((summary.water_ml / targets.water_ml) * 100, 999)),
  };
}

function groupEntries(entries, productsById) {
  const entriesBySection = createEmptyEntriesMap();

  for (const entry of entries) {
    const product = productsById[entry.product_id];

    if (!product) {
      continue;
    }

    entriesBySection[entry.section_key].push({
      id: entry.id,
      section_key: entry.section_key,
      product_id: product.id,
      product_name: product.name,
      amount: Number(entry.amount),
      unit_label: product.unit_label,
      nutrition: calculateEntryNutrition(product, Number(entry.amount)),
    });
  }

  return entriesBySection;
}

function buildDashboard(entries, productsById, dbTargets) {
  const summary = buildSummary(entries, productsById);
  const targets = {
    ...DEFAULT_TARGETS,
    ...dbTargets,
  };

  return {
    summary,
    targets,
    balances: buildBalances(summary, targets),
    progress: buildProgress(summary, targets),
  };
}

module.exports = {
  calculateEntryNutrition,
  createEmptyEntriesMap,
  buildSummary,
  buildDashboard,
  groupEntries,
};
