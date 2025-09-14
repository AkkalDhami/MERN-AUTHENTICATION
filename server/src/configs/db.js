import mongoose from 'mongoose';

export async function connectToDatabase() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('MONGO_URI is not set in environment variables');
    }

    mongoose.set('strictQuery', true);

    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
        return mongoose;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}



