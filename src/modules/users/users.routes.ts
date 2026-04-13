import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createUserSchema, updateUserSchema } from './users.schemas';
import * as usersController from './users.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', requirePermission('users:read'), usersController.list);
router.post('/', requirePermission('users:create'), validate(createUserSchema), usersController.create);
router.put('/:id', requirePermission('users:update'), validate(updateUserSchema), usersController.update);
router.patch('/:id/toggle', requirePermission('users:update'), usersController.toggle);
router.delete('/:id', requirePermission('users:delete'), usersController.remove);

export default router;
