import express from 'express';
import {
    register,
    login,
    getMe,
    updateProfile,
    sendSignupOTP,
    verifySignupOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    googleAuth
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import {
    authLimiter,
    otpLimiter,
    passwordResetLimiter,
    createAccountLimiter
} from '../middlewares/security.middleware.js';

const router = express.Router();

// =============================================
// PUBLIC AUTH ROUTES (with rate limiting)
// =============================================

// Login - 5 attempts per 15 minutes
router.post('/login', authLimiter, login);

// Registration - legacy route (still uses OTP flow)
router.post('/register', createAccountLimiter, register);

// Google OAuth - uses account limiter for new accounts
router.post('/google', authLimiter, googleAuth);

// OTP verification routes - 3 requests per 10 minutes
router.post('/send-otp', createAccountLimiter, otpLimiter, sendSignupOTP);
router.post('/verify-otp', otpLimiter, verifySignupOTP);
router.post('/resend-otp', otpLimiter, resendOTP);

// Forgot password routes - 3 requests per hour
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);

// =============================================
// PROTECTED AUTH ROUTES
// =============================================

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
