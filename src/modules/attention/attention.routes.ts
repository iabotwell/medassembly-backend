import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import * as ctrl from './attention.controller';

const router = Router();
router.use(authMiddleware);

router.post('/patients/:id', requirePermission('attentions:create'), ctrl.start);
router.put('/:id', requirePermission('attentions:update'), ctrl.update);
router.patch('/:id/doctor-notes', requirePermission('attentions:update'), ctrl.addDoctorNotes);
router.patch('/:id/discharge', requirePermission('discharge'), ctrl.discharge);
router.post('/:id/supplies', requirePermission('attentions:update'), ctrl.addSupply);
router.delete('/:id', requirePermission('attentions:delete'), ctrl.remove);
router.delete('/:id/measurements/:measurementId', requirePermission('measurements:delete'), ctrl.removeMeasurement);

export default router;
