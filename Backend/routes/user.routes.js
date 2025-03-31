import express from 'express';
const router = express.Router();   
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';


router.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({min: 3}).withMessage('First Name Must be at least 3 characters'),
    body('password').isLength({min: 6}).withMessage('Password Must be at least 6 characters'),
],
    userController.registerUser
)

router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min: 6}).withMessage('Password Must be at least 6 characters'),
],
    userController.loginUser
)


router.get('/peofile', authMiddleware.authUser, userController.getUserProfile)


export default router;