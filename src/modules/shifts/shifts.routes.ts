import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import * as ctrl from './shifts.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.post('/', requirePermission('shifts:create'), ctrl.create);
router.put('/:id', requirePermission('shifts:update'), ctrl.update);
router.patch('/:id/activate', requirePermission('shifts:update'), ctrl.activate);
router.post('/:id/members', requirePermission('shifts:update'), ctrl.addMember);
router.delete('/:shiftId/members/:memberId', requirePermission('shifts:update'), ctrl.removeMember);
router.get('/active', ctrl.getActive);

export default router;
