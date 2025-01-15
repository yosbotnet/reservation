import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { validate, validatePartial, ValidationRule } from '../utils/validation';

export const validateRequest = (
  schema: { [key: string]: ValidationRule<any>[] },
  location: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[location];
      validate(data, schema);
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(422).json({
          status: 'Validation Error',
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  };
};

export const validatePartialRequest = (
  schema: { [key: string]: ValidationRule<any>[] },
  location: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[location];
      validatePartial(data, schema);
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(422).json({
          status: 'Validation Error',
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  };
};

// Common validation schemas
export const paginationSchema = {
  page: [
    {
      validate: (value: any) => 
        typeof value === 'undefined' || 
        (typeof value === 'number' && value > 0),
      message: 'Page must be a positive number',
    },
  ],
  limit: [
    {
      validate: (value: any) =>
        typeof value === 'undefined' ||
        (typeof value === 'number' && value > 0 && value <= 100),
      message: 'Limit must be a number between 1 and 100',
    },
  ],
};

export const dateRangeSchema = {
  startDate: [
    {
      validate: (value: any) =>
        typeof value === 'undefined' || !isNaN(Date.parse(value)),
      message: 'Start date must be a valid date',
    },
  ],
  endDate: [
    {
      validate: (value: any) =>
        typeof value === 'undefined' || !isNaN(Date.parse(value)),
      message: 'End date must be a valid date',
    },
  ],
};