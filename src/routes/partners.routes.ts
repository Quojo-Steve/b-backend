import { Router } from 'express';
import { container } from '../composition/container';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types/user.types';
import { uploadPartnerLogo } from '../middlewares/upload.middleware';

const router = Router();
const { partnersController } = container;
const contentAdminRoles = [UserRole.SUPER_ADMIN, UserRole.WEB_MANAGER];

router.get('/admin/all', authenticate, authorize(...contentAdminRoles), partnersController.listAll);
// Public - consortium partner directory is not sensitive information.
router.get('/', partnersController.list);
router.get('/country/:country', partnersController.byCountry);
router.get('/:id', partnersController.getById);

router.post('/', authenticate, authorize(...contentAdminRoles), uploadPartnerLogo, partnersController.create);
router.patch('/:id', authenticate, authorize(...contentAdminRoles), uploadPartnerLogo, partnersController.update);
router.patch('/:id/status', authenticate, authorize(...contentAdminRoles), partnersController.updateStatus);

export const partnersRouter = router;
