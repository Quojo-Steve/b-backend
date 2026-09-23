import { Router } from 'express';
import { container } from '../composition/container';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types/user.types';

const router = Router();
const { authController } = container;

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

// Staff-only directory of accounts.
router.get(
  '/users',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.TECHNICAL_REVIEWER),
  authController.listUsers,
);

export const authRouter = router;
