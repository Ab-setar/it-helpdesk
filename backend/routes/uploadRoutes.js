const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const path = require('path');
const fs = require('fs');

// Upload avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const user = await User.findById(req.user._id);

        // Delete old avatar if not the default
        if (user.avatarPath && user.avatarPath !== 'assets/default_avatar.png') {
            const oldFilename = user.avatarPath.replace('/uploads/', '');
            const oldFilePath = path.join(__dirname, '..', 'uploads', oldFilename);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        // Store as a URL path, not a filesystem path
        user.avatarPath = `/uploads/${req.file.filename}`;
        await user.save();

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: { avatarPath: `/uploads/${req.file.filename}` }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Upload ticket attachment
router.post('/ticket/:id', protect, upload.array('attachments', 5), async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        const attachments = req.files.map(file => ({
            fileName: file.originalname,
            filePath: `/uploads/${file.filename}`,
            fileSize: file.size,
            mimeType: file.mimetype
        }));

        ticket.attachments.push(...attachments);
        await ticket.save();

        res.json({
            success: true,
            message: 'Attachments uploaded successfully',
            data: attachments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;