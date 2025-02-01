import { body, param, query } from 'express-validator';
import { validate } from './validators.js';

// User Management
export const createUserValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter'),
  body('tipoutente')
    .isIn(['admin', 'dottore', 'paziente'])
    .withMessage('Invalid role specified'),
  // Conditional validation for dottore role
  body('numeroRegistrazione')
    .if(body('tipoutente').equals('dottore'))
    .matches(/^[A-Z0-9]{10}$/)
    .withMessage('Invalid registration number format'),
  body('nome')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('cognome')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Surname must be between 2 and 50 characters'),
  body('specializzazioni')
    .if(body('tipoutente').equals('dottore'))
    .isArray()
    .withMessage('Specializations must be provided for doctors'),
  validate
];

export const updateUserValidation = [
  param('cf')
    .isString()
    .isLength({ min: 16, max: 16 })
    .withMessage('Invalid fiscal code format'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter'),
  validate
];

// Operating Room Management
export const operatingRoomValidation = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('attrezzature')
    .optional()
    .isArray()
    .withMessage('Equipment must be an array of IDs'),
  body('attrezzature.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Equipment IDs must be positive integers'),
  validate
];

export const updateOperatingRoomValidation = [
  param('id_sala')
    .isInt({ min: 1 })
    .withMessage('Invalid operating room ID'),
  ...operatingRoomValidation
];

// Equipment Management
export const equipmentValidation = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  validate
];

export const updateEquipmentValidation = [
  param('id_attrezzatura')
    .isInt({ min: 1 })
    .withMessage('Invalid equipment ID'),
  ...equipmentValidation
];

// Surgery Types Management
export const surgeryTypeValidation = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('durata')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  body('costo')
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  body('complessita')
    .isIn(['bassa', 'media', 'alta'])
    .withMessage('Complexity must be one of: bassa, media, alta'),
  body('attrezzature')
    .optional()
    .isArray()
    .withMessage('Required equipment must be an array'),
  body('attrezzature.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Equipment IDs must be positive integers'),
  validate
];

// Statistics
export const statisticsValidation = [
  query('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  validate
];
