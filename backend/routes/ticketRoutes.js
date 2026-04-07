const express = require('express');
const router = express.Router();
const { protect, seniorOfficerOnly, checkTeamAccess } = require('../middleware/authMiddleware');
const { ticketValidation } = require('../middleware/validationMiddleware');
const ticketController = require('../controllers/ticketController');

router.post('/', protect, ticketValidation, ticketController.createTicket);
router.get('/', protect, ticketController.getTickets);
router.get('/:id', protect, checkTeamAccess, ticketController.getTicketById);
router.put('/:id', protect, checkTeamAccess, ticketController.updateTicket);
router.delete('/:id', protect, checkTeamAccess, ticketController.deleteTicket);
router.post('/:id/comments', protect, checkTeamAccess, ticketController.addComment);

module.exports = router;