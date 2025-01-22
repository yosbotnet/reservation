import { body, param, query, validationResult } from 'express-validator';

export const registerValidation = [
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
    .isIn(['paziente', 'dottore', 'admin'])
    .withMessage('Invalid role specified'),
  body('nome')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('cognome')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Surname must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('telefono')
    .matches(/^\+?[\d\s-]{8,20}$/)
    .withMessage('Invalid phone number format'),
  // Conditional validation for paziente role
  body('codiceFiscale')
    .if(body('tipoutente').equals('paziente'))
    .matches(/^[A-Z0-9]{16}$/)
    .withMessage('Invalid fiscal code format'),
  body('dataNascita')
    .if(body('tipoutente').equals('paziente'))
    .isISO8601()
    .withMessage('Invalid date format'),
  body('gruppoSanguigno')
    .if(body('tipoutente').equals('paziente'))
    .isIn(['A_', 'A_MINUS', 'B_', 'B_MINUS', 'AB_', 'AB_MINUS', 'ZERO_', 'ZERO_MINUS'])
    .withMessage('Invalid blood type'),
  // Conditional validation for dottore role
  body('numeroRegistrazione')
    .if(body('tipoutente').equals('dottore'))
    .matches(/^[A-Z0-9]{10}$/)
    .withMessage('Invalid registration number format'),
  body('specializzazioni')
    .if(body('tipoutente').equals('dottore'))
    .isString()
    .withMessage('Specializations must be provided for doctors')
];

export const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Middleware to check if validation passed
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};