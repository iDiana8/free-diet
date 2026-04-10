const { SECTION_KEYS } = require('./constants');

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateDate(value) {
  if (typeof value !== 'string') {
    return 'Дата должна быть строкой';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return 'Дата должна быть в формате YYYY-MM-DD';
  }

  return '';
}

function validateEntry(entry, index) {
  if (!isPlainObject(entry)) {
    return `Запись ${index + 1} должна быть объектом`;
  }

  if (!SECTION_KEYS.includes(entry.section_key)) {
    return `Запись ${index + 1}: неизвестный блок питания`;
  }

  if (!Number.isInteger(entry.product_id) || entry.product_id <= 0) {
    return `Запись ${index + 1}: product_id должен быть положительным числом`;
  }

  if (typeof entry.amount !== 'number' || Number.isNaN(entry.amount)) {
    return `Запись ${index + 1}: amount должен быть числом`;
  }

  if (entry.amount <= 0 || entry.amount > 5000) {
    return `Запись ${index + 1}: amount должен быть в диапазоне 1-5000`;
  }

  return '';
}

function validateOptionalNumber(value, min, max, message) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    return message;
  }

  if (value < min || value > max) {
    return message;
  }

  return '';
}

function validateHealthMetrics(payload) {
  if (payload === null || payload === undefined) {
    return '';
  }

  if (!isPlainObject(payload)) {
    return 'Поле health_metrics должно быть объектом';
  }

  const systolicError = validateOptionalNumber(
    payload.blood_pressure_systolic,
    50,
    300,
    'Систолическое давление должно быть числом от 50 до 300',
  );

  if (systolicError) {
    return systolicError;
  }

  const diastolicError = validateOptionalNumber(
    payload.blood_pressure_diastolic,
    30,
    200,
    'Диастолическое давление должно быть числом от 30 до 200',
  );

  if (diastolicError) {
    return diastolicError;
  }

  const sugarError = validateOptionalNumber(
    payload.blood_sugar_level,
    1,
    40,
    'Уровень сахара должен быть числом от 1 до 40',
  );

  if (sugarError) {
    return sugarError;
  }

  return '';
}

function validateDailyPayload(payload) {
  if (!isPlainObject(payload)) {
    return 'Тело запроса должно быть объектом';
  }

  if (typeof payload.note !== 'string') {
    return 'Поле note должно быть строкой';
  }

  if (payload.note.length > 4000) {
    return 'Заметка слишком длинная';
  }

  if (!Array.isArray(payload.entries)) {
    return 'Поле entries должно быть массивом';
  }

  if (payload.entries.length > 200) {
    return 'Слишком много записей за день';
  }

  const healthMetricsError = validateHealthMetrics(payload.health_metrics);

  if (healthMetricsError) {
    return healthMetricsError;
  }

  for (let index = 0; index < payload.entries.length; index += 1) {
    const errorMessage = validateEntry(payload.entries[index], index);

    if (errorMessage) {
      return errorMessage;
    }
  }

  return '';
}

function validateAuthPayload(payload) {
  if (!isPlainObject(payload)) {
    return 'Тело запроса должно быть объектом';
  }

  if (typeof payload.name !== 'string' || payload.name.trim().length < 2 || payload.name.trim().length > 80) {
    return 'Имя должно быть строкой длиной от 2 до 80 символов';
  }

  if (typeof payload.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return 'Email должен быть валидным адресом';
  }

  if (typeof payload.password !== 'string' || payload.password.length < 6 || payload.password.length > 120) {
    return 'Пароль должен быть длиной от 6 до 120 символов';
  }

  return '';
}

function validateLoginPayload(payload) {
  if (!isPlainObject(payload)) {
    return 'Тело запроса должно быть объектом';
  }

  if (typeof payload.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return 'Email должен быть валидным адресом';
  }

  if (typeof payload.password !== 'string' || payload.password.length < 6 || payload.password.length > 120) {
    return 'Пароль должен быть длиной от 6 до 120 символов';
  }

  return '';
}

function validateProfilePayload(payload) {
  if (!isPlainObject(payload)) {
    return 'Тело запроса должно быть объектом';
  }

  const heightError = validateOptionalNumber(
    payload.height_cm,
    50,
    260,
    'Рост должен быть числом от 50 до 260',
  );

  if (heightError) {
    return heightError;
  }

  const weightError = validateOptionalNumber(
    payload.weight_kg,
    20,
    400,
    'Вес должен быть числом от 20 до 400',
  );

  if (weightError) {
    return weightError;
  }

  const ageError = validateOptionalNumber(
    payload.age_years,
    1,
    120,
    'Возраст должен быть числом от 1 до 120',
  );

  if (ageError) {
    return ageError;
  }

  return '';
}

function validateCatalogProductPayload(payload) {
  if (!isPlainObject(payload)) {
    return 'Тело запроса должно быть объектом';
  }

  if (!SECTION_KEYS.includes(payload.section_key)) {
    return 'Нужно указать корректный блок для продукта';
  }

  if (typeof payload.name !== 'string' || payload.name.trim().length < 2 || payload.name.trim().length > 120) {
    return 'Название продукта должно быть строкой длиной от 2 до 120 символов';
  }

  const caloriesError = validateOptionalNumber(
    payload.calories,
    0,
    5000,
    'Калорийность должна быть числом от 0 до 5000',
  );

  if (caloriesError || payload.calories === null || payload.calories === undefined) {
    return caloriesError || 'Калорийность обязательна';
  }

  const proteinError = validateOptionalNumber(
    payload.protein,
    0,
    500,
    'Белки должны быть числом от 0 до 500',
  );

  if (proteinError) {
    return proteinError;
  }

  const fatError = validateOptionalNumber(
    payload.fat,
    0,
    500,
    'Жиры должны быть числом от 0 до 500',
  );

  if (fatError) {
    return fatError;
  }

  const carbsError = validateOptionalNumber(
    payload.carbs,
    0,
    500,
    'Углеводы должны быть числом от 0 до 500',
  );

  if (carbsError) {
    return carbsError;
  }

  return '';
}

module.exports = {
  validateDate,
  validateDailyPayload,
  validateAuthPayload,
  validateLoginPayload,
  validateProfilePayload,
  validateHealthMetrics,
  validateCatalogProductPayload,
};
