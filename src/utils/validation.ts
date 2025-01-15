import { ValidationError } from './errors';

export type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

export const required = (fieldName: string): ValidationRule<any> => ({
  validate: (value: any) => value !== undefined && value !== null && value !== '',
  message: `${fieldName} is required`,
});

export const isString = (fieldName: string): ValidationRule<any> => ({
  validate: (value: any) => typeof value === 'string',
  message: `${fieldName} must be a string`,
});
export const isCodiceFiscale = (fieldName: string): ValidationRule<any> => ({
  validate: (x) => x.length === 16,
  message: `${fieldName} must be a valid codice fiscale`,
});
export const isNumber = (fieldName: string): ValidationRule<any> => ({
  validate: (value: any) => typeof value === 'number' && !isNaN(value),
  message: `${fieldName} must be a number`,
});

export const isDate = (fieldName: string): ValidationRule<any> => ({
  validate: (value: any) => !isNaN(Date.parse(value)),
  message: `${fieldName} must be a valid date`,
});

export const minLength = (fieldName: string, min: number): ValidationRule<string> => ({
  validate: (value: string) => value.length >= min,
  message: `${fieldName} must be at least ${min} characters long`,
});

export const maxLength = (fieldName: string, max: number): ValidationRule<string> => ({
  validate: (value: string) => value.length <= max,
  message: `${fieldName} must not exceed ${max} characters`,
});

export const isEmail = (fieldName: string): ValidationRule<string> => ({
  validate: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  message: `${fieldName} must be a valid email address`,
});

export const matches = (fieldName: string, pattern: RegExp): ValidationRule<string> => ({
  validate: (value: string) => pattern.test(value),
  message: `${fieldName} format is invalid`,
});

export const validate = <T extends object>(
  data: T,
  schema: { [K in keyof T]?: ValidationRule<T[K]>[] }
): void => {
  const errors: string[] = [];

  const entries = Object.entries(schema) as [keyof T, ValidationRule<any>[]][];
  
  for (const [field, rules] of entries) {
    if (!rules) continue;

    const value = data[field];
    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }
};

export const validatePartial = <T extends object>(
  data: Partial<T>,
  schema: { [K in keyof T]?: ValidationRule<T[K]>[] }
): void => {
  const errors: string[] = [];

  const entries = Object.entries(schema) as [keyof T, ValidationRule<any>[]][];

  for (const [field, rules] of entries) {
    if (!rules) continue;

    const value = data[field];
    if (value !== undefined) {
      for (const rule of rules) {
        if (!rule.validate(value)) {
          errors.push(rule.message);
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }
};