import { body, param, query } from 'express-validator';
import { validate } from './validators.js';

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
  body('ruolo')
    .isIn(['ADMIN', 'DOTTORE'])
    .withMessage('Invalid role specified'),
  // Conditional validation for DOTTORE role
  body('numeroRegistrazione')
    .if(body('ruolo').equals('DOTTORE'))
    .matches(/^[A-Z0-9]{10}$/)
    .withMessage('Invalid registration number format'),
  body('nome')
    .if(body('ruolo').equals('DOTTORE'))
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('cognome')
    .if(body('ruolo').equals('DOTTORE'))
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Surname must be between 2 and 50 characters'),
  body('specializzazioni')
    .if(body('ruolo').equals('DOTTORE'))
    .isString()
    .withMessage('Specializations must be provided for doctors'),
  validate
];

export const updateUserValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID'),
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

export const operatingRoomValidation = [
  body('codice')
    .matches(/^[A-Z0-9]{10}$/)
    .withMessage('Invalid operating room code format'),
  body('nome')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('attrezzatureFisse')
    .optional()
    .isString()
    .withMessage('Fixed equipment must be a string'),
  validate
];

export const equipmentValidation = [
  body('codiceInventario')
    .matches(/^[A-Z0-9]{20}$/)
    .withMessage('Invalid inventory code format'),
  body('nome')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('stato')
    .optional()
    .isIn(['DISPONIBILE', 'IN_USO', 'MANUTENZIONE'])
    .withMessage('Invalid equipment status'),
  body('ultimaManutenzione')
    .optional()
    .isISO8601()
    .withMessage('Invalid maintenance date format'),
  validate
];

export const surgeryTypeValidation = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('durataStimata')
    .isInt({ min: 1 })
    .withMessage('Estimated duration must be a positive integer'),
  body('descrizione')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('complessita')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Complexity must be between 0 and 10'),
  body('attrezzatureNecessarie')
    .optional()
    .isArray()
    .withMessage('Required equipment must be an array'),
  body('attrezzatureNecessarie.*')
    .optional()
    .matches(/^[A-Z0-9]{20}$/)
    .withMessage('Invalid equipment inventory code format'),
  validate
];

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