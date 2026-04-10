const FOOD_SECTION_KEYS = ['breakfast', 'lunch', 'dinner', 'snacks'];
const DRINK_SECTION_KEYS = ['drinks'];
const WATER_SECTION_KEYS = ['water'];

function normalizeProductName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9%]+/gi, ' ')
    .trim();
}

function buildProductConfigBySection(sectionKey) {
  if (sectionKey === 'water') {
    return {
      product_kind: 'water',
      unit_label: 'мл',
      allowed_sections: WATER_SECTION_KEYS,
    };
  }

  if (sectionKey === 'drinks') {
    return {
      product_kind: 'drink',
      unit_label: 'мл',
      allowed_sections: DRINK_SECTION_KEYS,
    };
  }

  return {
    product_kind: 'food',
    unit_label: 'г',
    allowed_sections: FOOD_SECTION_KEYS,
  };
}

module.exports = {
  FOOD_SECTION_KEYS,
  DRINK_SECTION_KEYS,
  WATER_SECTION_KEYS,
  normalizeProductName,
  buildProductConfigBySection,
};
