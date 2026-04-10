const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
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