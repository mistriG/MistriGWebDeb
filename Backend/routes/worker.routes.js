import express from 'express';
import { body } from 'express-validator';
import * as workerController from '../controllers/worker.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Worker registration route
router.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({min: 3}).withMessage('First Name Must be at least 3 characters'),
    body('password').isLength({min: 6}).withMessage('Password Must be at least 6 characters'),
    body('phoneNumber').notEmpty().withMessage('Phone Number is required'),
    body('profession').isIn(['electrician', 'plumber', 'carpenter', 'painter', 'mason', 'gardener', 'cleaner', 'mechanic', 'other']).withMessage('Invalid profession'),
    body('experience').isInt({min: 0}).withMessage('Experience must be a positive number'),
    body('location').notEmpty().withMessage('Location is required')
], workerController.registerWorker);

// Worker login route
router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min: 6}).withMessage('Password Must be at least 6 characters'),
], workerController.loginWorker);

// Get worker profile route
router.get('/profile', authMiddleware.authWorker, workerController.getWorkerProfile);

// Update worker profile route
router.put('/profile', authMiddleware.authWorker, [
    body('email').optional().isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').optional().isLength({min: 3}).withMessage('First Name Must be at least 3 characters'),
    body('phoneNumber').optional().notEmpty().withMessage('Phone Number is required'),
    body('profession').optional().isIn(['electrician', 'plumber', 'carpenter', 'painter', 'mason', 'gardener', 'cleaner', 'mechanic', 'other']).withMessage('Invalid profession'),
    body('experience').optional().isInt({min: 0}).withMessage('Experience must be a positive number'),
    body('location').optional().notEmpty().withMessage('Location is required')
], workerController.updateWorkerProfile);

// Get workers by profession
router.get('/profession/:profession', workerController.getWorkersByProfession);

// Get workers by location
router.get('/location/:location', workerController.getWorkersByLocation);

export default router; 