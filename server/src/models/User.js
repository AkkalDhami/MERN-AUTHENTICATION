import mongoose from "mongoose";
import argon2 from "argon2";
import crypto from "crypto";
import { RESET_PASSWORD_EXPIRY } from "../constants/constant.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        select: false
    },
    googleId: {
        type: String,
        default: null
    },
    loginMethod: {
        type: String,
        enum: ['manual', 'google', 'github'],
        default: 'manual'
    },
    avatar: {
        url: String,
        public_id: String,
        default: ""
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    is2FAEnabled: {
        type: Boolean,
        default: false
    },
    bio: {
        type: String,
        trim: true,
        default: "Hey, I'm using Neptask"
    },
    otp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Otp"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: { type: String },
    role: {
        type: String,
        enum: ["owner", "admin", "member", 'viewer', 'guest'],
        default: "member",
    },

    lastLogin: Date,
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        try {
            this.password = await argon2.hash(this.password);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await argon2.verify(this.password, candidatePassword);
    } catch (error) {
        throw error
    }
}


const User = mongoose.model('User', userSchema);

export default User;