import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import * as ctrl from './triage.controller';

const router = Router();
router.use(authMiddleware);

router.get('/questions', ctrl.listQuestions);
router.post('/questions', requirePermission('triage:create'), ctrl.createQuestion);
router.put('/questions/:id', requirePermission('triage:update'), ctrl.updateQuestion);
router.patch('/questions/:id/toggle', requirePermission('triage:update'), ctrl.toggleQuestion);
router.delete('/questions/:id', requirePermission('triage:update'), ctrl.deleteQuestion);

router.post('/patients/:id', requirePermission('triage:create'), ctrl.performTriage);
router.put('/patients/:id', requirePermission('triage:update'), ctrl.updateTriage);

export default router;
