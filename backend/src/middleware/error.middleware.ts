// Author: Florian Rischer
import { Request, Response, NextFunction } from 'express';

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error('Error:', err);

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message,
      type: 'ValidationError'
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      type: 'CastError'
    });
  }

  // Handle duplicate key errors
  if ((err as { code?: number }).code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry - this resource already exists',
      type: 'DuplicateKeyError'
    });
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      type: 'ApiError'
    });
  }

  // Default to 500 internal server error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    type: 'InternalError'
  });
};

// 404 handler for unknown routes
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    type: 'NotFound'
  });
};
