import { Router } from 'express';
import { healthRouter } from './health.routes';
import { authRouter } from './auth.routes';
import { partnersRouter } from './partners.routes';
import { trainingsRouter } from './trainings.routes';
import { newslettersRouter } from './newsletters.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/partners', partnersRouter);
router.use('/trainings', trainingsRouter);
router.use('/newsletters', newslettersRouter);

// Future modules mount here following the same pattern, e.g.:
// router.use('/resources', resourcesRouter);
// router.use('/countries', countriesRouter);

export const apiRouter = router;
