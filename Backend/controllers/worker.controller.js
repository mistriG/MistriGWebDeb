import workerModel from '../models/worker.model.js';
import * as workerService from '../services/worker.service.js';
import { validationResult } from 'express-validator';

export const registerWorker = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullname, email, password, phoneNumber, profession, experience, location, bio } = req.body;

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
        res.status(201).json({ token, worker });
    } catch (error) {
        if (error.message === 'Worker with this email already exists') {
            return res.status(400).json({ message: error.message });
        }
        console.error('Error registering worker:', error);
        res.status(500).json({ message: 'Server error' });
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
        }

        const updatedWorker = await workerService.updateWorker(req.worker._id, updates);
        
        res.status(200).json(updatedWorker);
    } catch (error) {
        console.error('Error updating worker profile:', error);
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