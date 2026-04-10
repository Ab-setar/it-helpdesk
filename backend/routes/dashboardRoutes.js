const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Ticket = require('../models/Ticket');

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
    try {
        let matchQuery = { isDeleted: false };

        // Senior officers only see their team's tickets
        if (req.user.role === 'senior_officer' && req.user.teamId) {
            matchQuery.teamId = req.user.teamId;
        }

        const [total, open, inProgress, closed] = await Promise.all([
            Ticket.countDocuments(matchQuery),
            Ticket.countDocuments({ ...matchQuery, status: 'Open' }),
            Ticket.countDocuments({ ...matchQuery, status: 'In Progress' }),
            Ticket.countDocuments({ ...matchQuery, status: 'Closed' }),
        ]);

        res.json({
            success: true,
            data: { total, open, inProgress, closed },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
