import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';

export const registerUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {fullname, email, password, mobileNumber} = req.body;
        
        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashPassword = await userModel.hashPassword(password);

        const user = await userService.createUser({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashPassword,
            mobileNumber
        });

        const token = user.generateAuthToken();
        res.status(201).json({token, user });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        res.status(500).json({ message: 'Server error during registration' });
    }
}


export const loginUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password} = req.body;

        const user = await userModel.findOne({email}).select('+password');

        if (!user) {
            return res.status(401).json({message: 'Invalid Email or Password'});
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({message: 'Invalid Email or Password'});
        }
        const token = user.generateAuthToken();

        res.cookie('token', token);
        
        res.status(200).json({token, user});
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
}


export const getUserProfile = async (req, res, next) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
}