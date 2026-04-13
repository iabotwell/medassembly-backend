import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createPatientSchema, updateStatusSchema } from './patients.schemas';
import * as ctrl from './patients.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', requirePermission('patients:read'), ctrl.list);
router.post('/', requirePermission('patients:create'), validate(createPatientSchema), ctrl.create);
router.get('/queue', requirePermission('patients:read'), ctrl.getQueue);
router.get('/:id', requirePermission('patients:read'), ctrl.getDetail);
router.patch('/:id/status', requirePermission('patients:update'), validate(updateStatusSchema), ctrl.updateStatus);

export default router;
