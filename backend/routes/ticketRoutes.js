const express = require('express');
const router = express.Router();
const { protect, seniorOfficerOnly, checkTeamAccess } = require('../middleware/authMiddleware');
const { validate, body } = require('../middleware/validationMiddleware');
const ticketController = require('../controllers/ticketController');

router.post('/',
    protect,
    body('issueType').trim().notEmpty().withMessage('Issue type is required'),
    body('description').trim().notEmpty().withMessage('Description is required')
        .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
    validate,
    ticketController.createTicket
);

router.get('/', protect, ticketController.getTickets);
router.get('/:id', protect, checkTeamAccess, ticketController.getTicketById);
router.put('/:id', protect, checkTeamAccess, ticketController.updateTicket);
router.delete('/:id', protect, checkTeamAccess, ticketController.deleteTicket);
router.post('/:id/comments', protect, checkTeamAccess, ticketController.addComment);

module.exports = router;
