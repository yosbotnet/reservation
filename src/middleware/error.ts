import { Request, Response, NextFunction } from 'express';
import { AppError, handleError, isOperationalError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle operational errors
  if (isOperationalError(err)) {
    const appError = err as AppError;
    return res.status(appError.statusCode).json({
      status: appError.status,
      message: appError.message,
    });
  }

  // Handle unexpected errors
  const error = handleError(err);
  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const err = new AppError(
    404,
    'Not Found',
    `Cannot ${req.method} ${req.path}`
  );
  next(err);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};