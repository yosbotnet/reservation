export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Prisma error handling
  if (err.code) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        return res.status(409).json({
          error: 'A record with this value already exists'
        });
      case 'P2025': // Record not found
        return res.status(404).json({
          error: 'Record not found'
        });
      case 'P2003': // Foreign key constraint violation
        return res.status(400).json({
          error: 'Invalid reference to a related record'
        });
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: err.message,
      details: err.errors
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};