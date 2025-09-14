import express from 'express';

import { otpRequestLimiter } from '../utils/rateLimiter.js';
import {
    changePassword,
    forgotPassword,
    getUserprofile,
    googleLogin,
    loginUser,
    logoutUser,
    registerUser,
    resetPassword,
    updateProfile
} from '../controllers/authController.js';
import { requestOtp, verifyOtp } from '../controllers/otpController.js';

import { authRequired, isAuthenticated } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/profile', authRequired, isAuthenticated, getUserprofile);

router.post('/register', registerUser);
router.post('/login', loginUser);

router.post('/otp-request', authRequired, isAuthenticated, requestOtp);
router.post('/otp-verify', authRequired, isAuthenticated, verifyOtp);


router.post('/reset-password-request', forgotPassword);
router.post('/reset-password/:token', resetPassword)

router.post('/change-password', authRequired, isAuthenticated, changePassword);
router.post('/logout', authRequired, isAuthenticated, logoutUser)

router.put('/update-profile', upload.single('avatar'), authRequired, isAuthenticated, updateProfile);


router.post('/google-login', googleLogin);

export default router;