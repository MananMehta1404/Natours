const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Authentication routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Forgot and Reset password routes
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);  // Update password route
router.get('/me', userController.getMe, userController.getUser);  // Get current user route
router.patch('/updateMe', userController.updateMe);  // Update user data route
router.delete('/deleteMe', userController.deleteMe);  // Delete user route

// Restrict all routes after this middleware to admin only
router.use(authController.restrictTo('admin'));

router.route('/')
    .get(userController.getAllUsers)  // Get all users route
    .post(userController.createUser);  // Create user route
    
router.route('/:id')
    .get(userController.getUser)  // Get user route
    .patch(userController.updateUser)  // Update user route
    .delete(userController.deleteUser);  // Delete user route

// Exporting the router
module.exports = router;