const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, phoneNumber } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phoneNumber,
            role: 'submitter'
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user with password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                teamId: user.teamId,
                avatarPath: user.avatarPath,
                preferences: user.preferences,
                token
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Always return success for security (don't reveal if email exists)
        if (user) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour

            await PasswordReset.findOneAndUpdate(
                { email },
                { token: hashedToken, expiresAt },
                { upsert: true, new: true }
            );

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

            await sendEmail({
                to: email,
                subject: 'Password Reset Request',
                html: `
                    <h1>Password Reset</h1>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                    <p>This link expires in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            });
        }

        res.json({
            success: true,
            message: 'If an account exists with this email, a reset link has been sent'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const resetRecord = await PasswordReset.findOne({ token: hashedToken });

        if (!resetRecord || resetRecord.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        const user = await User.findOne({ email: resetRecord.email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.password = newPassword;
        await user.save();

        await PasswordReset.deleteOne({ token });

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        // Email is intentionally excluded — changing email requires
        // a separate verified flow to prevent account takeover
        const { name, phoneNumber, preferences } = req.body;

        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                avatarPath: user.avatarPath,
                preferences: user.preferences
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};