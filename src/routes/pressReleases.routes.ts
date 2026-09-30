import { Router } from 'express';
import { container } from '../composition/container';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadPressReleaseDocument } from '../middlewares/upload.middleware';
import { UserRole } from '../types/user.types';

const router = Router();
const { pressReleaseController } = container;

const contentAdminRoles = [UserRole.SUPER_ADMIN, UserRole.WEB_MANAGER];

router.get('/admin/all', authenticate, authorize(...contentAdminRoles), pressReleaseController.listAll);
router.get('/admin/:id', authenticate, authorize(...contentAdminRoles), pressReleaseController.getByIdForAdmin);

router.get('/', pressReleaseController.listPublished);
router.get('/:id', pressReleaseController.getPublishedById);

router.post('/', authenticate, authorize(...contentAdminRoles), uploadPressReleaseDocument, pressReleaseController.create);
router.patch('/:id', authenticate, authorize(...contentAdminRoles), uploadPressReleaseDocument, pressReleaseController.update);
router.patch('/:id/status', authenticate, authorize(...contentAdminRoles), pressReleaseController.updateStatus);

export const pressReleasesRouter = router;
