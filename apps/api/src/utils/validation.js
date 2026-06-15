import { badRequest } from './errors.js';

export function parsePositiveId(value, fieldName = 'id') {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw badRequest(`${fieldName} invalido`);
  }

  return parsed;
}

export function requiredString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw badRequest(`${fieldName} e obrigatorio`);
  }

  return value.trim();
}

export function optionalString(value) {
  if (value === undefined || value === null) return null;
  return String(value).trim() || null;
}

export function positiveNumber(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw badRequest(`${fieldName} deve ser maior que zero`);
  }

  return parsed;
}

export function requiredDate(value, fieldName) {
  const date = requiredString(value, fieldName);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw badRequest(`${fieldName} deve estar no formato YYYY-MM-DD`);
  }

  return date;
}
