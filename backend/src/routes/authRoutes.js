const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation middleware
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('password').notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', loginValidation, authController.login);
router.post('/social-login', authController.socialLogin);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/sessions', protect, authController.getActiveSessions);
router.delete('/sessions/:sessionId', protect, authController.revokeSession);

module.exports = router;
