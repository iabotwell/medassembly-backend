import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import * as ctrl from './emergency.controller';

const router = Router();
router.use(authMiddleware);

router.post('/patients/:id', requirePermission('emergency:sos'), ctrl.activate);
router.patch('/:id/resolve', requirePermission('emergency:sos'), ctrl.resolve);
router.get('/', requirePermission('dashboard:read'), ctrl.listActive);

export default router;
