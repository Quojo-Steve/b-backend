import { Router } from 'express';
import { container } from '../composition/container';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types/user.types';

const router = Router();
const { trainingsController } = container;
const contentAdminRoles = [UserRole.SUPER_ADMIN, UserRole.WEB_MANAGER];

// NOTE: route order matters. The fixed paths (/applications/*, /admin/all,
// /cohorts/:cohortId) must stay above the generic /:id routes.

// ---- Registrations ---------------------------------------------------------
// Public - anyone can register for an open cohort.
router.post('/applications', trainingsController.submitApplication);

// Staff-only - registrations contain personal data. web_manager can read them
// so the data can be presented to them (trainings are not hosted on the platform).
const staffRoles = [
  UserRole.SUPER_ADMIN,
  UserRole.WEB_MANAGER,
  UserRole.COUNTRY_COORDINATOR,
  UserRole.TECHNICAL_REVIEWER,
];
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

// ---- Trainings & cohorts ---------------------------------------------------
router.get('/admin/all', authenticate, authorize(...contentAdminRoles), trainingsController.listAllTrainings);

// Public - published trainings with cohort availability.
router.get('/', trainingsController.listPublishedTrainings);
router.get('/:id', trainingsController.getPublishedTraining);

router.post('/', authenticate, authorize(...contentAdminRoles), trainingsController.createTraining);
router.patch('/cohorts/:cohortId', authenticate, authorize(...contentAdminRoles), trainingsController.updateCohort);
router.patch('/:id', authenticate, authorize(...contentAdminRoles), trainingsController.updateTraining);
router.patch('/:id/status', authenticate, authorize(...contentAdminRoles), trainingsController.updateTrainingStatus);
router.post('/:id/cohorts', authenticate, authorize(...contentAdminRoles), trainingsController.addCohort);

export const trainingsRouter = router;
