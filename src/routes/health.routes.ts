import { Router } from 'express';
import { container } from '../composition/container';

const router = Router();
const { healthController } = container;

router.get('/', healthController.check);
router.get('/live', healthController.live);
router.get('/ready', healthController.ready);

export const healthRouter = router;
