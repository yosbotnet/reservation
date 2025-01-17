import { body, param, query } from 'express-validator';
import { validate } from './validators.js';

export const availabilityValidation = [
  param('doctorId')
    .matches(/^[A-Z0-9]{10}$/)
    .withMessage('Invalid doctor registration number format'),
  query('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      const start = new Date(req.query.startDate);
      const end = new Date(endDate);
      if (end <= start) {
        throw new Error('End date must be after start date');
      }
      // Limit range to 31 days
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (diffDays > 31) {
        throw new Error('Date range cannot exceed 31 days');
      }
      return true;
    }),
  validate
];

export const bookAppointmentValidation = [
  body('doctorId')
    .matches(/^[A-Z0-9]{10}$/)
    .withMessage('Invalid doctor registration number format'),
  body('patientId')
    .matches(/^[A-Z0-9]{16}$/)
    .withMessage('Invalid fiscal code format'),
  body('slotId')
    .isInt({ min: 1 })
    .withMessage('Invalid slot ID'),
  body('motivo')
    .isString()
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Reason must be between 3 and 1000 characters'),
  validate
];

export const patientAppointmentsValidation = [
  param('patientId')
    .matches(/^[A-Z0-9]{16}$/)
    .withMessage('Invalid fiscal code format'),
  query('status')
    .optional()
    .isIn(['RICHIESTA', 'CONFERMATA', 'COMPLETATA', 'CANCELLATA'])
    .withMessage('Invalid appointment status'),
  validate
];