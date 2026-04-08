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

module.exports = {
  validateDate,
  validateDailyPayload,
  validateAuthPayload,
  validateLoginPayload,
};
