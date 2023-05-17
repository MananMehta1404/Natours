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

// Update password route
router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

// Get current user route
router.get('/me', authController.protect, userController.getMe, userController.getUser);

// Update user data route
router.patch('/updateMe', authController.protect, userController.updateMe);

// Delete user route
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);
    
router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;