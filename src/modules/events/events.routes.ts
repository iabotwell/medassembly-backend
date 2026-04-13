import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import * as eventsController from './events.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', eventsController.list);
router.post('/', requirePermission('events:create'), eventsController.create);
router.put('/:id', requirePermission('events:update'), eventsController.update);
router.patch('/:id/activate', requirePermission('events:update'), eventsController.activate);
router.get('/active', eventsController.getActive);

export default router;
