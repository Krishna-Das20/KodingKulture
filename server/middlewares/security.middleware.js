import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

// Check if we're in development mode
const isDev = process.env.NODE_ENV !== 'production';

// Standard API rate limiter - much higher in dev
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDev ? 1000 : 100, // 1000 in dev, 100 in prod
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false
});

// Auth rate limiter - 5 attempts per 15 minutes (brute force protection)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful logins
});

// OTP rate limiter - 3 requests per 10 minutes (prevent spam)
export const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3,
    message: {
        success: false,
        message: 'Too many OTP requests, please try again after 10 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Password reset rate limiter - 3 requests per hour
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again after 1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Submission rate limiter - 10 submissions per 5 minutes
export const submissionLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message: {
        success: false,
        message: 'Too many code submissions, please try again after 5 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Slow down middleware - DISABLED in development, progressively delays in production
export const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: isDev ? 10000 : 50, // Effectively disabled in dev (10000 requests before delay)
    delayMs: (hits) => isDev ? 0 : hits * 100, // No delay in dev
    maxDelayMs: isDev ? 0 : 5000 // No max delay in dev
});

// Create account limiter - prevent mass account creation
export const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 accounts per hour per IP
    message: {
        success: false,
        message: 'Too many accounts created from this IP, please try again after 1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Strict limiter for sensitive operations
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        success: false,
        message: 'Rate limit exceeded for sensitive operation'
    },
    standardHeaders: true,
    legacyHeaders: false
});
