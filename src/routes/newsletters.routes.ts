import { Router } from 'express';
import { container } from '../composition/container';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types/user.types';

const router = Router();
const { newslettersController } = container;

// Public - anyone can subscribe or unsubscribe.
router.post('/subscribe', newslettersController.subscribe);
router.post('/unsubscribe', newslettersController.unsubscribe);

// Admin-only - creating and sending newsletters, and viewing the list.
const adminRoles = [UserRole.SUPER_ADMIN, UserRole.WEB_MANAGER];
router.post('/', authenticate, authorize(...adminRoles), newslettersController.create);
router.get('/', authenticate, authorize(...adminRoles), newslettersController.list);
router.get('/subscribers', authenticate, authorize(...adminRoles), newslettersController.listSubscribers);
router.get('/:id', authenticate, authorize(...adminRoles), newslettersController.getById);
router.post('/:id/send', authenticate, authorize(...adminRoles), newslettersController.send);

export const newslettersRouter = router;
