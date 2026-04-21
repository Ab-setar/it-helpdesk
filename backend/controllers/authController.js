const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');

// Safe error response — never expose internals in production
const serverError = (res, error) => {
    console.error(error);
    res.status(500).json({
        success: false,
        message: 'Server error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, phoneNumber } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const user = await User.create({ name, email, password, phoneNumber, role: 'submitter' });
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { _id: user._id, name: user.name, email: user.email, role: user.role, token }
        });
    } catch (error) {
        serverError(res, error);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Update last login without triggering pre-save hook
        await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

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
        serverError(res, error);
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
            const expiresAt = new Date(Date.now() + 3600000);

            await PasswordReset.findOneAndUpdate(
                { email },
                { token: hashedToken, expiresAt },
                { upsert: true, new: true }
            );

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

            // Fire-and-forget — don't block response on email
            sendEmail({
                to: email,
                subject: 'Password Reset Request',
                html: `
                    <h1>Password Reset</h1>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                    <p>This link expires in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            }).catch(err => console.error('Password reset email failed:', err));
        }

        // Always return success — don't reveal if email exists
        res.json({
            success: true,
            message: 'If an account exists with this email, a reset link has been sent'
        });
    } catch (error) {
        serverError(res, error);
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const resetRecord = await PasswordReset.findOne({ token: hashedToken });

        if (!resetRecord || resetRecord.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        const user = await User.findOne({ email: resetRecord.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();

        await PasswordReset.deleteOne({ token: hashedToken });

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        serverError(res, error);
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        serverError(res, error);
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, data: user });
    } catch (error) {
        serverError(res, error);
    }
};

exports.updateProfile = async (req, res) => {
    try {
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
        serverError(res, error);
    }
};
