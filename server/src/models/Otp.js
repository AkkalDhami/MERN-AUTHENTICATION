import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    codeHash: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    consumed: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0
    },
    email: {
        type: String,
        required: true
    }
}, { timestamps: true });

// delete otp after 5 minutes
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });



const Otp = mongoose.models.Otp || mongoose.model('Otp', otpSchema);

export default Otp;