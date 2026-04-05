const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

const registerValidation = [
    body('name').notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    validate
];

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

const ticketValidation = [
    body('issueType').notEmpty().withMessage('Issue type is required'),
    body('description').notEmpty().withMessage('Description is required').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
    validate
];

module.exports = {
    registerValidation,
    loginValidation,
    ticketValidation
};