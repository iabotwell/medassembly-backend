import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import * as ctrl from './contacts.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.post('/', requirePermission('contacts:create'), ctrl.create);
router.put('/:id', requirePermission('contacts:update'), ctrl.update);
router.delete('/:id', requirePermission('contacts:delete'), ctrl.remove);

export default router;
