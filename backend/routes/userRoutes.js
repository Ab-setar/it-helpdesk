const express = require('express');
const router = express.Router();
const { protect, adminOnly, seniorOfficerOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Team = require('../models/Team');

// Get all users (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password').populate('teamId', 'teamName');
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all teams (admin + senior officer)
router.get('/teams', protect, seniorOfficerOnly, async (req, res) => {
    try {
        const teams = await Team.find({ isActive: true });
        res.json({ success: true, data: teams });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create team (admin only)
router.post('/teams', protect, adminOnly, async (req, res) => {
    try {
        const { teamName, description } = req.body;
        const team = await Team.create({ teamName, description });
        res.status(201).json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get officers by team (admin + senior officer)
router.get('/teams/:teamId/officers', protect, seniorOfficerOnly, async (req, res) => {
    try {
        const officers = await User.find({ role: 'senior_officer', teamId: req.params.teamId })
            .select('name email');
        res.json({ success: true, data: officers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create senior officer (admin only)
router.post('/senior-officer', protect, adminOnly, async (req, res) => {
    try {
        const { name, email, password, phoneNumber, teamId } = req.body;

        // Convert empty string to null for ObjectId field
        const resolvedTeamId = teamId && teamId.trim() !== '' ? teamId : null;

        if (resolvedTeamId) {
            const existingOfficer = await User.findOne({ teamId: resolvedTeamId, role: 'senior_officer' });
            if (existingOfficer) {
                return res.status(400).json({
                    success: false,
                    message: 'This team already has a senior officer'
                });
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            phoneNumber: phoneNumber || null,
            role: 'senior_officer',
            teamId: resolvedTeamId
        });

        res.status(201).json({
            success: true,
            message: 'Senior officer created successfully',
            data: { _id: user._id, name: user.name, email: user.email, teamId: user.teamId }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get senior officers
router.get('/senior-officers', protect, async (req, res) => {
    try {
        const officers = await User.find({ role: 'senior_officer' })
            .select('name email phoneNumber avatarPath')
            .populate('teamId', 'teamName');
        res.json({ success: true, data: officers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete user (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
        }
        await user.deleteOne();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

// Get all users (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password').populate('teamId', 'teamName');
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create senior officer (admin only)
router.post('/senior-officer', protect, adminOnly, async (req, res) => {
    try {
        const { name, email, password, phoneNumber, teamId } = req.body;

        // Check if team already has a senior officer
        const existingOfficer = await User.findOne({ teamId, role: 'senior_officer' });
        if (existingOfficer) {
            return res.status(400).json({
                success: false,
                message: 'This team already has a senior officer'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            phoneNumber,
            role: 'senior_officer',
            teamId
        });

        res.status(201).json({
            success: true,
            message: 'Senior officer created successfully',
            data: { _id: user._id, name: user.name, email: user.email, teamId: user.teamId }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get senior officers
router.get('/senior-officers', protect, async (req, res) => {
    try {
        const officers = await User.find({ role: 'senior_officer' })
            .select('name email phoneNumber avatarPath')
            .populate('teamId', 'teamName');
        res.json({ success: true, data: officers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete user (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Don't allow deleting self
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
        }

        await user.deleteOne();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;