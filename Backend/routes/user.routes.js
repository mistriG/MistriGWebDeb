const express = require('express');
const router = express.Router();   
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');


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


router.get('/peofile',authMiddleware.authUser, userController.getUserProfile)


module.exports = router;