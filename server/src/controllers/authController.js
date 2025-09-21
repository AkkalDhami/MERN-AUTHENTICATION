
import fs from 'fs';
import path from 'path';
import mjml2html from 'mjml';
import crypto from 'crypto'

import { sendMessageToEmail } from "../utils/email.js";

import { TryCatch } from "../middlewares/tryCatch.js";
import User from "../models/User.js";
import {
    generateResetPasswordToken,
    setAuthCookies,
    signAccessToken,
    signRefreshToken
} from "../utils/auth.js";
import {
    changePasswordSchema,
    forgotPasswordSchema,
    loginUserSchema,
    registerUserSchema,
    resetPasswordSchema
} from "../validators/authValidators.js";

import cloudinary from '../configs/cloudinary.js';


//? REGISTER USER
export const registerUser = TryCatch(async (req, res) => {
    const { success, data, error } = registerUserSchema.safeParse(req.body);
    if (!success) {
        console.log("ERR: ", error)
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
    const { name, email, password } = data;
    const userExist = await User.findOne({ email: email });
    if (userExist) {
        return res.status(400).json({
            success: false,
            message: "User with this email already exist!"
        });
    }

    const user = await User.create({
        name, email, password
    });

    const payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    user.refreshToken = refreshToken;
    await user.save();


    setAuthCookies({ res, accessToken, refreshToken })

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        refreshToken,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        accessToken
    });
});

//? LOGIN USER
export const loginUser = TryCatch(async (req, res) => {
    if (req.user) return;

    const { success, error, data } = loginUserSchema.safeParse(req.body);
    console.log(error);
    if (!success) {
        return res.status(401).json({
            success: false,
            message: error
        })
    }

    const { email, password } = data;

    if (!email || !password) return res.status(401).json({
        success: false,
        message: 'Invalid Credentials'
    })

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Credentials'
        })
    }

    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) return res.status(400).json({
        success: false,
        message: 'Invalid Credentials'
    })

    const payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    await setAuthCookies({ res, accessToken, refreshToken })

    res.status(200).json({
        success: true,
        message: 'Login Successfull!',
        refreshToken,
        accessToken,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
    })
})

//? LOGOUT USER
export const logoutUser = TryCatch(async (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
})

//? FORGOT PASSWORD
export const forgotPassword = TryCatch(async (req, res) => {
    const { success, error, data } = forgotPasswordSchema.safeParse(req.body);
    if (!success) {
        return res.status(401).json({
            success: false,
            message: error
        })
    }
    const { email } = data;

    const user = await User.findOne({ email });


    const { resetPasswordExpire, resetPasswordToken, resetToken } = generateResetPasswordToken();
    if (user) {
        user.resetPasswordExpire = resetPasswordExpire;
        user.resetPasswordToken = resetPasswordToken;
        await user.save({ validateBeforeSave: false });
    }


    const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    console.log(resetPasswordUrl);

    const templatePath = path.resolve(process.cwd(), 'src', 'templates', 'reset-password.mjml');
    const mjml = fs.readFileSync(templatePath, 'utf8')
        .replaceAll('{{link}}', String(resetPasswordUrl))
        .replaceAll('{{APP_NAME}}', process.env.APP_NAME)
        .replaceAll('{{name}}', user?.name)
        .replaceAll('{{CURRENT_DATE}}', String(new Date().getFullYear().toString()));

    const { html, errors } = mjml2html(mjml, { validationLevel: 'soft' });
    if (!html) {
        throw new Error('Failed to render OTP email');
    }

    const subject = 'Reset your password';
    await sendMessageToEmail({ to: email, from: process.env.EMAIL_FROM, html, subject });

    res.status(200).json({
        success: true,
        message: `Reset Password Link sent to <${email}>`,
    });
})

//? RESET PASSWORD
export const resetPassword = TryCatch(async (req, res) => {
    const { success, error, data } = resetPasswordSchema.safeParse(req.body);
    if (!success) {
        return res.status(401).json({
            success: false,
            message: error
        })
    }

    const { newPassword } = data;
    const { token } = req.params;
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $lt: new Date() },
    }).select('+password')

    console.log(token, user);

    if (!user) return res.status(401).json({
        success: false,
        message: "Reset password token is invalid or has been expired",
    });


    user.password = newPassword;;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password Reset Successfully'
    })
})

//? CHANGE PASSWORD
export const changePassword = TryCatch(async (req, res) => {
    const { data, error, success } = changePasswordSchema.safeParse(req.body);
    if (!success) {
        return res.status(401).json({
            success: false,
            message: error
        })
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(401).json({
        success: false,
        message: "User Not Found"
    });


    const isEmailVerified = await User.findOne({ email: user.email, isEmailVerified: true });
    if (!isEmailVerified) return res.status(401).json({
        success: false,
        message: "Please verify your email first"
    });

    const { currentPassword, newPassword } = data;

    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) return res.status(401).json({
        success: false,
        message: "Current Password is incorrect"
    });

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password Changed Successfully'
    });
})

//? GET USER PROFILE
export const getUserprofile = TryCatch(async (req, res) => {
    console.log(req.user);
    const user = await User.findById(req.user?._id);
    if (!user) return res.status(401).json({
        success: false,
        message: "User Not Found"
    });

    res.status(200).json({
        success: true,
        user,
        message: "Get User"
    })
});

//? REFRESH REFRESH_TOKEN
export const refreshToken = TryCatch(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({
        success: false,
        message: "Unauthorized, Please Login First"
    });

    const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    if (!accessSecret) {
        return res.status(500).json({
            success: false,
            message: 'Missing JWT access secret'
        });
    }
    const payload = jwt.verify(refreshToken, accessSecret);
    const accessToken = signAccessToken(payload);

    res.status(200).json({
        success: true,
        accessToken,
        message: "Refresh Token"
    })
})

//? UPDATE PROFILE
export const updateProfile = TryCatch(async (req, res) => {

    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({
        success: false,
        message: "User Not Found"
    });

    const { name, bio, role, is2FAEnabled } = req.body;


    if (req?.file && user?.avatar?.public_id) {
        await cloudinary.uploader.destroy(user?.avatar?.public_id);
    }

    user.avatar = {
        public_id: req.file ? req.file.filename : user?.avatar?.public_id,
        url: req.file ? req.file.path : user.avatar.url
    }
    user.name = name;
    user.bio = bio;
    user.role = role;
    user.is2FAEnabled = is2FAEnabled;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile Updated Successfully'
    })
})


//? GOOGLE LOGIN
export const googleLogin = TryCatch(async (req, res) => { 
    console.log(req.params)
    const token = jwt.sign(req.user._id, process.env.JWT_SECRET, { expiresIn: '17d' });
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
})