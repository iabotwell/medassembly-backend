import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import * as ctrl from './congregations.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.post('/', requirePermission('congregations:create'), ctrl.create);
router.put('/:id', requirePermission('congregations:update'), ctrl.update);
router.delete('/:id', requirePermission('congregations:delete'), ctrl.remove);
router.get('/:id/elders', ctrl.listElders);
router.post('/:id/elders', requirePermission('congregations:create'), ctrl.createElder);
router.put('/:congId/elders/:id', requirePermission('congregations:update'), ctrl.updateElder);
router.delete('/:congId/elders/:id', requirePermission('congregations:delete'), ctrl.removeElder);

export default router;
