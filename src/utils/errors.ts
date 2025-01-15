export class AppError extends Error {
  constructor(
    public statusCode: number,
    public status: string,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, 'Not Found', message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, 'Bad Request', message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(422, 'Validation Error', message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'Conflict', message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(401, 'Unauthorized', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(403, 'Forbidden', message);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(500, 'Database Error', message);
  }
}

export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return true;
  }
  return false;
};

export const handleError = (error: Error): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    return new DatabaseError('Database operation failed');
  }

  if (error.name === 'PrismaClientValidationError') {
    return new ValidationError('Invalid data provided');
  }

  // Default to internal server error
  return new AppError(500, 'Internal Server Error', 'Something went wrong');
};