import User from "../models/User.js";
import { generateOtp, saveOtp } from "../utils/auth.js";
import { sendMessageToEmail } from "../utils/email.js";
import fs from 'fs';
import path from 'path';
import mjml2html from 'mjml';
import 'dotenv/config';
import crypto from 'crypto';
import Otp from "../models/Otp.js";

export async function requestOtp(req, res) {
    try {
        const email = req.body?.email;

        if (!email) {
            return res.status(401).json({
                success: false,
                message: 'Email is required'
            });
        }

        const { code, codeHash, expiresAt } = generateOtp();
        console.log(code);
        await saveOtp(email, codeHash, expiresAt);
        const templatePath = path.resolve(process.cwd(), 'src', 'templates', 'otp.mjml');
        const mjml = fs.readFileSync(templatePath, 'utf8')
            .replaceAll('{{CODE}}', String(code))
            .replaceAll('{{APP_NAME}}', process.env.APP_NAME)
            .replaceAll('{{CURRENT_DATE}}', String(new Date().getFullYear().toString()));

        const { html, errors } = mjml2html(mjml, { validationLevel: 'soft' });
        if (!html) {
            throw new Error('Failed to render OTP email');
        }

        const subject = 'Your One Time Password (OTP)';
        await sendMessageToEmail({ to: email, from: process.env.EMAIL_FROM, html, subject });

        return res.json({
            success: true,
            message: `OTP sent to <${email}>`
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Failed to send OTP'
        });
    }
}

export async function verifyOtp(req, res) {
    try {
        const { code, purpose = "", email = req?.user?.email || req.body.email } = req.body;

        if (!code || !/^[0-9]{6}$/.test(code)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP code"
            });
        }

        const codeHash = crypto.createHash("sha256").update(String(code)).digest("hex");
        const record = await Otp.findOne({ email }).sort({ createdAt: -1 });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "No OTP record found for this email"
            });
        }

        if (record.consumed || record.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired or already used"
            });
        }

        if (record.codeHash !== codeHash) {
            record.attempts += 1;

            if (record.attempts >= 5) {
                record.consumed = true;
                await record.save();
                return res.status(429).json({
                    success: false,
                    message: "Too many wrong attempts. OTP blocked."
                });
            }

            await record.save();
            return res.status(400).json({
                success: false,
                message: "Incorrect OTP"
            });
        }


        record.consumed = true;
        await record.save();

        // 6. Handle email verification purpose
        if (purpose === "email-verify") {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            if (user.isEmailVerified) {
                return res.status(400).json({
                    success: false,
                    message: `${email} is already verified`
                });
            }

            user.isEmailVerified = true;
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP"
        });
    }
}