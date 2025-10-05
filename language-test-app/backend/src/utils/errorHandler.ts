import { Request, Response, NextFunction } from 'express';
import { AppError, isAppError } from './errors';
import { logger } from './logger';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = isAppError(err) ? err.statusCode : 500;
  const message = err.message || 'Internal server error';

  if (statusCode >= 500) {
    logger.error('Unhandled error', err);
  } else {
    logger.warn('Handled error', err.message);
  }

  res.status(statusCode).json({
    message,
    details: isAppError(err) ? err.details : undefined
  });
};
