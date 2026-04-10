const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    registerValidation,
    loginValidation,
} = require('../middleware/validationMiddleware');
const auth = require('../controllers/authController');

// Public routes
router.post('/register', registerValidation, auth.register);
router.post('/login', loginValidation, auth.login);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);

// Protected routes (must be logged in)
router.get('/me', protect, auth.getMe);
router.put('/me', protect, auth.updateProfile);
router.put('/change-password', protect, auth.changePassword);

module.exports = router;
