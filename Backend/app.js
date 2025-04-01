import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import connectToDatabase from './db/database.js';
import userRoutes from './routes/user.routes.js';
import workerRoutes from './routes/worker.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

connectToDatabase();

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        
        // Allow all localhost origins regardless of port
        if(origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }
        
        // For production, you might want to be more restrictive
        const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
        if(allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the views directory
app.use(express.static(path.join(__dirname, '../views')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

export default app;