import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { Logger } from '../utils/Logger';
import { env } from '../config/env.config';

const logger = new Logger('ErrorHandler');

/**
 * Single place where errors become HTTP responses.
 * - Known, operational errors (instances of AppError) are surfaced with
 *   their intended status code and message.
 * - Anything else is treated as a bug: logged in full, but the client only
 *   ever sees a generic 500 message (never a stack trace or raw error).
 */
export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    logger.warn(err.message, { path: req.path, statusCode: err.statusCode });
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  logger.error('Unhandled error', {
    path: req.path,
    message: err.message,
    stack: env.isProduction ? undefined : err.stack,
  });

  res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred. Please try again later.',
  });
}
