const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validate, body } = require('../middleware/validationMiddleware');
const auth = require('../controllers/authController');

// Register
router.post('/register',
    body('name').trim().escape().notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').trim().normalizeEmail().isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) throw new Error('Passwords do not match');
        return true;
    }),
    validate,
    auth.register
);

// Login
router.post('/login',
    body('email').trim().normalizeEmail().isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
    auth.login
);

// Forgot / Reset password
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);

// Protected routes
router.get('/me', protect, auth.getMe);
router.put('/me', protect, auth.updateProfile);
router.put('/change-password', protect, auth.changePassword);

module.exports = router;
