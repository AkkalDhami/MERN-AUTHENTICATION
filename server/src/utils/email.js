import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import mjml2html from 'mjml';
import 'dotenv/config';

let transporter;

function getTransporter() {
    if (transporter) return transporter;
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM;
    if (!host || !user || !pass || !from) {
        throw new Error('SMTP/EMAIL env not configured');
    }
    transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });
    return transporter;
}

export async function sendOtpEmail({ to, code }) {
    const t = getTransporter();
    const from = process.env.EMAIL_FROM;
    const subject = 'Your Admin Login OTP';
    const text = `Your OTP is ${code}. It expires in 10 minutes.`;

    // Render MJML template
    const appName = process.env.APP_NAME || 'Portfolio Admin';
    const templatePath = path.resolve(process.cwd(), 'src', 'templates', 'otp.mjml');
    const mjml = fs.readFileSync(templatePath, 'utf8')
        .replaceAll('{{CODE}}', String(code))
        .replaceAll('{{APP_NAME}}', appName)
        .replaceAll('{{CURRENT_DATE}}', String(new Date().getFullYear().toString()));
    const { html, errors } = mjml2html(mjml, { validationLevel: 'soft' });
    if (!html) {
        throw new Error('Failed to render OTP email');
    }

    await t.sendMail({ from, to, subject, text, html });
}


export async function sendMessageToEmail({ to, from, html, subject }) {
    const t = getTransporter();
    await t.sendMail({ from, to, html, subject });
}
