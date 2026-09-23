import { Router } from 'express';
import { container } from '../composition/container';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types/user.types';

const router = Router();
const { trainingsController } = container;

// Public - anyone can apply, per the concept doc's "External applicant" role.
router.post('/applications', trainingsController.submitApplication);

// Staff-only - applications contain applicant personal data.
const staffRoles = [UserRole.SUPER_ADMIN, UserRole.COUNTRY_COORDINATOR, UserRole.TECHNICAL_REVIEWER];
router.get('/applications', authenticate, authorize(...staffRoles), trainingsController.listApplications);
router.get('/applications/:id', authenticate, authorize(...staffRoles), trainingsController.getApplication);

// Review/approval matches the workflow table: reviewed by country coordinator,
// with super admin retaining override capability.
router.patch(
  '/applications/:id/review',
  authenticate,
  authorize(UserRole.COUNTRY_COORDINATOR, UserRole.SUPER_ADMIN),
  trainingsController.reviewApplication,
);

export const trainingsRouter = router;
