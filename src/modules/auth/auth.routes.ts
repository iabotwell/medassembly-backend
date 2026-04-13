import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { requestOtpSchema, verifyOtpSchema, firebaseAuthSchema, refreshSchema } from './auth.schemas';
import * as authController from './auth.controller';

const router = Router();

router.post('/request-otp', validate(requestOtpSchema), authController.requestOtp);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/firebase', validate(firebaseAuthSchema), authController.firebaseLogin);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
