const { body, validationResult } = require('express-validator');

// Run after individual body() validators
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

module.exports = { validate, body };
