import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { loginPasswordSchema, verifyOtpSchema, resendOtpSchema, firebaseAuthSchema, refreshSchema } from './auth.schemas';
import * as authController from './auth.controller';

const router = Router();

// Step 1: email + password → sends OTP to email
router.post('/login', validate(loginPasswordSchema), authController.loginPassword);

// Step 2: email + OTP code → returns JWT
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);

// Resend OTP (requires recent valid password-step within 15 min)
router.post('/resend-otp', validate(resendOtpSchema), authController.resendOtp);

router.post('/firebase', validate(firebaseAuthSchema), authController.firebaseLogin);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
