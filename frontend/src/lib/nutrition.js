import { sections } from '../constants/sections';

export function createEmptyEntriesMap() {
  const result = {};

  for (const section of sections) {
    result[section.key] = [];
  }

  return result;
}

export function createClientRow(sectionKey) {
  return {
    client_id: `${sectionKey}-${Date.now()}-${Math.round(Math.random() * 100000)}`,
    section_key: sectionKey,
    product_id: '',
    amount: '',
  };
}

export function normalizeEntries(entriesBySection) {
  const normalizedEntries = createEmptyEntriesMap();

  for (const section of sections) {
    const rows = entriesBySection?.[section.key] || [];

    normalizedEntries[section.key] = rows.map((row, index) => ({
      client_id: row.id ? `${section.key}-${row.id}` : `${section.key}-${index}`,
      section_key: section.key,
      product_id: row.product_id,
      amount: row.amount,
    }));
  }

  return normalizedEntries;
}

export function createProductsById(products) {
  const result = {};

  for (const product of products) {
    result[product.id] = {
      ...product,
      base_amount: Number(product.base_amount),
      calories: Number(product.calories),
      protein: Number(product.protein),
      fat: Number(product.fat),
      carbs: Number(product.carbs),
    };
  }

  return result;
}

export function calculateRowNutrition(row, productsById) {
  const product = productsById[row.product_id];
  const amount = Number(row.amount);

  if (!product || !amount || amount <= 0) {
    return {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      water_ml: 0,
    };
  }

  const factor = amount / product.base_amount;

  return {
    calories: roundValue(product.calories * factor),
    protein: roundValue(product.protein * factor),
    fat: roundValue(product.fat * factor),
    carbs: roundValue(product.carbs * factor),
    water_ml: product.product_kind === 'water' ? roundValue(amount) : 0,
  };
}

export function buildSectionSummary(rows, productsById) {
  const summary = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    water_ml: 0,
  };

  for (const row of rows) {
    const nutrition = calculateRowNutrition(row, productsById);

    summary.calories += nutrition.calories;
    summary.protein += nutrition.protein;
    summary.fat += nutrition.fat;
    summary.carbs += nutrition.carbs;
    summary.water_ml += nutrition.water_ml;
  }

  return {
    calories: roundValue(summary.calories),
    protein: roundValue(summary.protein),
    fat: roundValue(summary.fat),
    carbs: roundValue(summary.carbs),
    water_ml: roundValue(summary.water_ml),
  };
}

export function buildDashboard(entriesBySection, products, targets) {
  const productsById = createProductsById(products);
  const summary = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    water_ml: 0,
  };

  for (const section of sections) {
    const sectionSummary = buildSectionSummary(entriesBySection[section.key] || [], productsById);

    summary.calories += sectionSummary.calories;
    summary.protein += sectionSummary.protein;
    summary.fat += sectionSummary.fat;
    summary.carbs += sectionSummary.carbs;
    summary.water_ml += sectionSummary.water_ml;
  }

  const roundedSummary = {
    calories: roundValue(summary.calories),
    protein: roundValue(summary.protein),
    fat: roundValue(summary.fat),
    carbs: roundValue(summary.carbs),
    water_ml: roundValue(summary.water_ml),
  };

  return {
    summary: roundedSummary,
    progress: {
      calories: buildPercent(roundedSummary.calories, targets.calories),
      protein: buildPercent(roundedSummary.protein, targets.protein),
      fat: buildPercent(roundedSummary.fat, targets.fat),
      carbs: buildPercent(roundedSummary.carbs, targets.carbs),
      water_ml: buildPercent(roundedSummary.water_ml, targets.water_ml),
    },
    balances: {
      calories: roundValue(roundedSummary.calories - targets.calories),
      protein: roundValue(roundedSummary.protein - targets.protein),
      fat: roundValue(roundedSummary.fat - targets.fat),
      carbs: roundValue(roundedSummary.carbs - targets.carbs),
      water_ml: roundValue(roundedSummary.water_ml - targets.water_ml),
    },
  };
}

export function createSavePayload(entriesBySection, note) {
  const entries = [];

  for (const section of sections) {
    const rows = entriesBySection[section.key] || [];

    for (const row of rows) {
      const productId = Number(row.product_id);
      const amount = Number(row.amount);

      if (!productId || !amount || amount <= 0) {
        continue;
      }

      entries.push({
        section_key: section.key,
        product_id: productId,
        amount,
      });
    }
  }

  return {
    note,
    entries,
  };
}

function buildPercent(currentValue, targetValue) {
  if (!targetValue) {
    return 0;
  }

  return roundValue(Math.min((currentValue / targetValue) * 100, 999));
}

function roundValue(value) {
  return Math.round(value * 10) / 10;
}
