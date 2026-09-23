/**
 * Base class for all errors that are anticipated and safe to translate
 * directly into an HTTP response. Anything thrown that is NOT an AppError
 * is treated by the error middleware as an unexpected internal failure.
 */
export abstract class AppError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly isOperational: boolean;

  protected constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly statusCode = 400;
  public readonly isOperational = true;

  constructor(message = 'The request payload is invalid.') {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  public readonly statusCode = 401;
  public readonly isOperational = true;

  constructor(message = 'Authentication is required or has failed.') {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  public readonly statusCode = 403;
  public readonly isOperational = true;

  constructor(message = 'You do not have permission to perform this action.') {
    super(message);
  }
}

export class NotFoundError extends AppError {
  public readonly statusCode = 404;
  public readonly isOperational = true;

  constructor(message = 'The requested resource was not found.') {
    super(message);
  }
}

export class ConflictError extends AppError {
  public readonly statusCode = 409;
  public readonly isOperational = true;

  constructor(message = 'The request conflicts with the current state of the resource.') {
    super(message);
  }
}
