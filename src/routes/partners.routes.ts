import { Router } from 'express';
import { container } from '../composition/container';

const router = Router();
const { partnersController } = container;

// Public - consortium partner directory is not sensitive information.
router.get('/', partnersController.list);
router.get('/country/:country', partnersController.byCountry);
router.get('/:id', partnersController.getById);

export const partnersRouter = router;
