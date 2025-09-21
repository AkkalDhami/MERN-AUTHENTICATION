import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Otp from '../models/Otp.js';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, RESET_PASSWORD_EXPIRY } from '../constants/constant.js';
import 'dotenv/config.js'

export function getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
    };
}

export function signAccessToken(payload) {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_ACCESS_EXPIRES || '15m';
    return jwt.sign(payload, secret, { expiresIn });
}

export function signRefreshToken(payload) {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_REFRESH_EXPIRES || '7d';
    return jwt.sign(payload, secret, { expiresIn });
}

export function generateOtp({ length = 6, ttlMinutes = 10 } = {}) {
    const code = String(Math.floor(Math.random() * Math.pow(10, length))).padStart(length, "0");
    const codeHash = crypto.createHash("sha256").update(String(code)).digest("hex");
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    return { code, codeHash, expiresAt };
}


export async function saveOtp(email, codeHash, expiresAt, purpose = "email-verify", meta = {}) {
    await Otp.updateMany({ email, purpose, consumed: false }, { consumed: true }).catch(() => { });
    const record = await Otp.create({
        email,
        purpose,
        codeHash,
        expiresAt,
        meta
    });
    return record;
}

export async function setAuthCookies({ res, accessToken, refreshToken }) {
    res.cookie('accessToken', accessToken, {
        ...getCookieOptions(),
        maxAge: ACCESS_TOKEN_EXPIRY
    });
    res.cookie('refreshToken', refreshToken, {
        ...getCookieOptions(),
        maxAge: REFRESH_TOKEN_EXPIRY
    });
}

export function generateResetPasswordToken() {
    const resetToken = crypto.randomBytes(28).toString("hex");

    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const resetPasswordExpire = new Date() + RESET_PASSWORD_EXPIRY;
    return {
        resetToken,
        resetPasswordToken,
        resetPasswordExpire
    };
};
