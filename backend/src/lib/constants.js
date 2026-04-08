const SECTION_KEYS = [
  'breakfast',
  'lunch',
  'dinner',
  'snacks',
  'water',
  'drinks',
];

const SECTION_LABELS = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snacks: 'Перекусы',
  water: 'Вода',
  drinks: 'Напитки',
};

const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 120,
  fat: 70,
  carbs: 220,
  water_ml: 2000,
};

module.exports = {
  SECTION_KEYS,
  SECTION_LABELS,
  DEFAULT_TARGETS,
};
