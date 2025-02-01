import { body, param, query } from 'express-validator';
import { validate } from './validators.js';

export const weeklyAvailabilityValidation = [
  body('cf_dottore')
    .matches(/^[A-Z0-9]{16}$/)
    .withMessage('Invalid fiscal code format'),
  body('availabilities')
    .isArray()
    .withMessage('Availabilities must be an array')
    .notEmpty()
    .withMessage('At least one availability must be provided'),
  body('availabilities.*.giornodellasettimana')
    .isIn(['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'])
    .withMessage('Invalid day of week'),
  body('availabilities.*.orainizio')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Start time must be in HH:mm:ss format'),
  body('availabilities.*.orafine')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('End time must be in HH:mm:ss format')
    .custom((value, { req }) => {
      const start = req.body.oraInizio;
      if (value <= start) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  validate
];

export const unavailabilityValidation = [
  body('cf_dottore')
    .matches(/^[A-Z0-9]{16}$/)
    .withMessage('Invalid fiscal code format'),
  body('dataoranizio')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date/time'),
  body('dataorafine')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date/time')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.dataoranizio)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  validate
];

export const scheduleValidation = [
  param('cf_dottore')
    .matches(/^[A-Z0-9]{16}$/)
    .withMessage('Invalid fiscal code format'),
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
      const days = Math.ceil((new Date(value) - new Date(req.query.startDate)) / (1000 * 60 * 60 * 24));
      if (days > 31) {
        throw new Error('Date range cannot exceed 31 days');
      }
      return true;
    }),
  validate
];

export const visitOutcomeValidation = [
  param('visitId')
    .isInt({ min: 1 })
    .withMessage('Invalid visit ID'),
  validate
];

export const surgeryScheduleValidation = [
  body('cf_paziente')
    .matches(/^[A-Z0-9]{16}$/)
    .withMessage('Invalid fiscal code format'),
  body('cf_dottore')
    .matches(/^[A-Z0-9]{16}$/)
    .withMessage('Invalid doctor registration number format'),
  body('id_tipo')
    .isInt({ min: 1 })
    .withMessage('Invalid surgery type ID'),
  body('id_sala')
    .isInt({ min: 1 })
    .withMessage('Invalid operating room ID'),
  validate
];
