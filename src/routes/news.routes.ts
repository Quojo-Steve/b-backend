import { Router } from 'express';
import { container } from '../composition/container';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadNewsImage } from '../middlewares/upload.middleware';
import { UserRole } from '../types/user.types';

const router = Router();
const { newsController } = container;

const contentAdminRoles = [UserRole.SUPER_ADMIN, UserRole.WEB_MANAGER];

// Public - the homepage/news-feed read side. Only published items.
router.get('/', newsController.listPublished);
router.get('/:id', newsController.getPublishedById);

// Admin (web manager / super admin) - content management.
router.get('/admin/all', authenticate, authorize(...contentAdminRoles), newsController.listAll);
router.get('/admin/:id', authenticate, authorize(...contentAdminRoles), newsController.getByIdForAdmin);
router.post('/', authenticate, authorize(...contentAdminRoles), uploadNewsImage, newsController.create);
router.patch('/:id', authenticate, authorize(...contentAdminRoles), uploadNewsImage, newsController.update);
// Replaces delete - see NewsService.setStatus.
router.patch('/:id/status', authenticate, authorize(...contentAdminRoles), newsController.updateStatus);

export const newsRouter = router;