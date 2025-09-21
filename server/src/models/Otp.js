import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    purpose: {
        type: String,
        required: true,
        index: true,
    },
    codeHash: {
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    consumed: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    meta: {
        type: mongoose.Schema.Types.Mixed
    }
});

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });


const Otp = mongoose.models.Otp || mongoose.model('Otp', otpSchema);

export default Otp;