import { body, param, query } from 'express-validator';
import { validate } from './validators.js';

export const availabilityValidation = [
  param('doctorId')
    .matches(/^[A-Z0-9]{16}$/)
    .withMessage('Invalid fiscal code format'),
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
    .matches(/^[A-Z0-9]{16}$/)
    .withMessage('Invalid fiscal code format'),
  body('patientId')
    .matches(/^[A-Z0-9]{16}$/)
    .withMessage('Invalid fiscal code format'),
  body('appointmentDateTime')
    .isISO8601()
    .withMessage('Appointment date must be a valid ISO 8601 date')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const now = new Date();
      if (appointmentDate <= now) {
        throw new Error('Appointment date must be in the future');
      }
      return true;
    }),
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