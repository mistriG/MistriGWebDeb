import mongoose from 'mongoose';

export default async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB database');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
} 