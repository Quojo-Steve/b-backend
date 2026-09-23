import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { loginSchema, registerSchema } from '../types/auth.schemas';
import { UnauthorizedError } from '../errors/AppError';
import { parseOrThrow } from '../utils/validateRequest';

/**
 * Translates HTTP requests into calls on AuthService and HTTP responses.
 * Contains no business logic itself - validation of shape belongs here,
 * validation of business rules (credentials, account status) belongs in
 * the service layer.
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = parseOrThrow(loginSchema, req.body);
      const result = await this.authService.login(email, password);

      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = parseOrThrow(registerSchema, req.body);
      const result = await this.authService.register(dto);

      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Returns the profile of the currently authenticated user, identified from
   * the JWT attached by the `authenticate` middleware - never from a client
   * supplied id.
   */
  public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('An authentication token is required.');
      }
      const user = await this.authService.getPublicUserById(req.user.sub);
      res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
      next(error);
    }
  };

  /**
   * JWTs are stateless and carry their own expiry, so there is no
   * server-side session to destroy. This endpoint exists for a conventional
   * REST contract and for a future token-blacklist/refresh-token scheme;
   * for now the client is responsible for discarding the token.
   */
  public logout = (_req: Request, res: Response): void => {
    res.status(200).json({
      status: 'success',
      message: 'Logged out. Discard the access token on the client.',
    });
  };

  public listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.authService.listUsers();
      res.status(200).json({ status: 'success', data: { users } });
    } catch (error) {
      next(error);
    }
  };
}
