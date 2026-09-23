import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.config';
import { IJwtPayload } from '../types/user.types';
import { UnauthorizedError } from '../errors/AppError';

/**
 * Wraps token signing/verification so the rest of the codebase depends on
 * this abstraction rather than the jsonwebtoken library directly.
 */
export class TokenService {
  public sign(payload: IJwtPayload): string {
    const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
    return jwt.sign(payload, env.jwtSecret, options);
  }

  public verify(token: string): IJwtPayload {
    try {
      return jwt.verify(token, env.jwtSecret) as IJwtPayload;
    } catch {
      throw new UnauthorizedError('The provided token is invalid or has expired.');
    }
  }
}
