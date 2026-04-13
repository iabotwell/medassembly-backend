import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { loginSchema, firebaseAuthSchema, refreshSchema } from './auth.schemas';
import * as authController from './auth.controller';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/firebase', validate(firebaseAuthSchema), authController.firebaseLogin);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
