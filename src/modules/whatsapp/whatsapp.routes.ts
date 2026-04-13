import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import * as ctrl from './whatsapp.controller';

const router = Router();
router.use(authMiddleware);

router.get('/templates', ctrl.listTemplates);
router.put('/templates/:id', requirePermission('whatsapp:update'), ctrl.updateTemplate);
router.post('/send', requirePermission('whatsapp:send'), ctrl.sendMessage);
router.get('/status', ctrl.getStatus);

export default router;
