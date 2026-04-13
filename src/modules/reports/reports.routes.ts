import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import * as ctrl from './reports.controller';

const router = Router();
router.use(authMiddleware);

router.get('/shift/:shiftId', requirePermission('reports:read'), ctrl.shiftReport);
router.get('/event/:eventId', requirePermission('reports:read'), ctrl.eventReport);
router.get('/patient/:patientId', requirePermission('reports:read'), ctrl.patientReport);
router.get('/supplies/:eventId', requirePermission('reports:read'), ctrl.suppliesReport);
router.get('/team/:eventId', requirePermission('reports:read'), ctrl.teamReport);
router.get('/dashboard', requirePermission('dashboard:read'), ctrl.dashboard);

export default router;
