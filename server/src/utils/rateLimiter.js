import rateLimit from 'express-rate-limit';

export const otpRequestLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 3,
    message: {
        success: false,
        message: 'Too many OTP requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
