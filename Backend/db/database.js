import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export default async function connectToDatabase() {
    try {
        // Use MongoDB Memory Server if no URI is provided
        if (!process.env.MONGODB_URI) {
            mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();
            console.log('Using MongoDB Memory Server:', uri);
            await mongoose.connect(uri);
        } else {
            // Try with provided URI first
            try {
                await mongoose.connect(process.env.MONGODB_URI);
                console.log('Connected to MongoDB database using provided URI');
            } catch (error) {
                console.error('Failed to connect with provided URI:', error.message);
                
                // Fallback to Memory Server
                mongoServer = await MongoMemoryServer.create();
                const uri = mongoServer.getUri();
                console.log('Falling back to MongoDB Memory Server:', uri);
                await mongoose.connect(uri);
            }
        }
        console.log('Connected to MongoDB database');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
} 