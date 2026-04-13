import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import * as ctrl from './measurements.controller';

const router = Router();
router.use(authMiddleware);

router.get('/:id/measurements', requirePermission('measurements:read'), ctrl.list);
router.post('/:id/measurements', requirePermission('measurements:create'), ctrl.add);

export default router;
