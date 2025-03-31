import userModel from '../models/user.model.js';
import workerModel from '../models/worker.model.js';
import jwt from 'jsonwebtoken';

// Helper function to extract token from request
const getToken = (req) => {
    // Check for token in cookies
    if (req.cookies && (req.cookies.token || req.cookies.workerToken)) {
        return req.cookies.token || req.cookies.workerToken;
    }
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        return req.headers.authorization.split(' ')[1];
    }
    
    return null;
};

// Middleware for client authentication
export const authUser = async (req, res, next) => {
    const token = getToken(req);
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // If token is for a worker, reject
        if (decoded.type === 'worker') {
            return res.status(403).json({ message: 'Forbidden - Worker tokens not accepted for client routes' });
        }
        
        const user = await userModel.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }
        
        req.user = user;
        next();
    } catch (err) {
        console.error('Auth error:', err.message);
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};

// Middleware for worker authentication
export const authWorker = async (req, res, next) => {
    const token = getToken(req);
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // If token is not for a worker, reject
        if (decoded.type !== 'worker') {
            return res.status(403).json({ message: 'Forbidden - Client tokens not accepted for worker routes' });
        }
        
        const worker = await workerModel.findById(decoded._id);
        if (!worker) {
            return res.status(401).json({ message: 'Unauthorized - Worker not found' });
        }
        
        req.worker = worker;
        next();
    } catch (err) {
        console.error('Auth error:', err.message);
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};

// Middleware for general authentication (either user or worker)
export const authAny = async (req, res, next) => {
    const token = getToken(req);
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.type === 'worker') {
            const worker = await workerModel.findById(decoded._id);
            if (!worker) {
                return res.status(401).json({ message: 'Unauthorized - Worker not found' });
            }
            req.worker = worker;
            req.userType = 'worker';
        } else {
            const user = await userModel.findById(decoded._id);
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized - User not found' });
            }
            req.user = user;
            req.userType = 'client';
        }
        
        next();
    } catch (err) {
        console.error('Auth error:', err.message);
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};