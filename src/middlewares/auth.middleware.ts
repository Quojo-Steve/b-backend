import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../utils/TokenService';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { IJwtPayload, UserRole } from '../types/user.types';

// Augment Express's Request type so `req.user` is known throughout the app.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}

const tokenService = new TokenService();

/**
 * Verifies the Bearer token on the Authorization header and attaches the
 * decoded payload to `req.user`. Intended for routes that require any
 * authenticated stakeholder (admin, coordinator, partner, etc.).
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('An authentication token is required.');
  }

  const token = header.slice('Bearer '.length);
  req.user = tokenService.verify(token);
  next();
}

/**
 * Restricts a route to a specific set of roles. Must run after `authenticate`.
 * Usage: router.get('/admin-only', authenticate, authorize(UserRole.SUPER_ADMIN), handler)
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('An authentication token is required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Your role does not permit this action.');
    }

    next();
  };
}
