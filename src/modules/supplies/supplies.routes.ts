import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import * as ctrl from './supplies.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.post('/', requirePermission('supplies:create'), ctrl.create);
router.put('/:id', requirePermission('supplies:update'), ctrl.update);
router.delete('/:id', requirePermission('supplies:delete'), ctrl.remove);

export default router;
