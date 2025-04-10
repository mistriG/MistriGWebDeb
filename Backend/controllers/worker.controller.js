import workerModel from '../models/worker.model.js';
import * as workerService from '../services/worker.service.js';
import { validationResult } from 'express-validator';

export const registerWorker = async (req, res, next) => {
    try {
        console.log('Received worker registration request:', {
            email: req.body.email,
            fullname: req.body.fullname
        });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullname, email, password, phoneNumber, profession, experience, location, bio } = req.body;

        // Log the incoming data
        console.log('Processing registration for:', {
            email,
            fullname,
            profession,
            location
        });

        const hashPassword = await workerModel.hashPassword(password);

        const worker = await workerService.createWorker({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashPassword,
            phoneNumber,
            profession,
            experience,
            location,
            bio
        });

        const token = worker.generateAuthToken();
        console.log('Successfully registered worker:', {
            id: worker._id,
            email: worker.email
        });
        
        res.status(201).json({ token, worker });
    } catch (error) {
        console.error('Error in registerWorker:', error);
        
        if (error.message === 'Worker with this email already exists') {
            return res.status(400).json({ 
                message: error.message,
                details: 'Please try logging in or use a different email address'
            });
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation Error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({ 
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const loginWorker = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const worker = await workerModel.findOne({ email }).select('+password');

        if (!worker) {
            return res.status(401).json({ message: 'Invalid Email or Password' });
        }
        
        const isMatch = await worker.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Email or Password' });
        }
        
        const token = worker.generateAuthToken();

        res.cookie('workerToken', token);
        
        res.status(200).json({ token, worker });
    } catch (error) {
        console.error('Error logging in worker:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getWorkerProfile = async (req, res, next) => {
    try {
        res.status(200).json(req.worker);
    } catch (error) {
        console.error('Error getting worker profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateWorkerProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const updates = req.body;
        
        // Don't allow password updates through this route
        if (updates.password) {
            delete updates.password;
        }

        // Handle fullname updates
        if (updates.fullname) {
            if (typeof updates.fullname !== 'object') {
                return res.status(400).json({ message: 'Invalid fullname format' });
            }
            
            // Validate lastname length
            if (updates.fullname.lastname && updates.fullname.lastname.length < 3) {
                return res.status(400).json({ message: 'Last name must be at least 3 characters long' });
            }
        }

        try {
            const updatedWorker = await workerService.updateWorker(req.worker._id, updates);
            res.status(200).json(updatedWorker);
        } catch (error) {
            console.error('Error updating worker profile:', error);
            
            // Check for validation errors from Mongoose
            if (error.name === 'ValidationError') {
                const validationErrors = {};
                
                // Extract validation error messages
                Object.keys(error.errors).forEach(key => {
                    validationErrors[key] = error.errors[key].message;
                });
                
                return res.status(400).json({
                    message: 'Validation failed: ' + Object.values(validationErrors).join(', '),
                    errors: validationErrors
                });
            }
            
            res.status(500).json({ message: 'Failed to update profile. Please try again.' });
        }
    } catch (error) {
        console.error('Error in updateWorkerProfile controller:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getWorkersByProfession = async (req, res, next) => {
    try {
        const { profession } = req.params;
        
        const workers = await workerService.findWorkersByProfession(profession);
        
        res.status(200).json(workers);
    } catch (error) {
        console.error('Error getting workers by profession:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getWorkersByLocation = async (req, res, next) => {
    try {
        const { location } = req.params;
        
        const workers = await workerService.findWorkersByLocation(location);
        
        res.status(200).json(workers);
    } catch (error) {
        console.error('Error getting workers by location:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 