import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();

import { connectToDatabase } from './configs/db.js';
import { errorHandler } from './middlewares/errorHandler.js';
import "./configs/passport.js"

import authRouter from './routes/authRoutes.js';

const app = express();

// Middleware
const rawCorsOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawCorsOrigins.split(',').map((s) => s.trim());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json({ extended: true, }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use((req, res, next) => {
    res.locals.user = req.user;
    return next();
})
app.use('/api/auth', authRouter);




app.get('/', (req, res) => {
    res.json({ status: 'ok', });
});

app.use((req, res) => {
    res.status(404).json({ message: '404 Not Found' });
});

// Error handler
app.use(errorHandler);


const PORT = process.env.PORT || 3000;

connectToDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    });
