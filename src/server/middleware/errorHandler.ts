import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

interface ApiError {
  code: string;
  message: string;
  fields?: any;
}

export const errorHandler = (err: any, _req: Request, res: Response, next: NextFunction) => {
  // If headers have already been sent, delegate to Express's default error handler
  if (res.headersSent) {
    return next(err);
  }

  // Log the error
  logger.error(err, 'Error occurred');

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const payload: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      fields: err.flatten(),
    };
    return res.status(400).json({ error: payload });
  }

  // Handle custom ApiError instances
  if (err.code && err.message) {
    return res.status(err.statusCode || 500).json({ error: err });
  }

  // Default error handling
  const statusCode = err.statusCode || 500;
  const errorResponse: ApiError = {
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message || 'Unknown error'
  };

  res.status(statusCode).json({ error: errorResponse });
};