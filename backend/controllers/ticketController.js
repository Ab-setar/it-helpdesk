const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const StatusHistory = require('../models/StatusHistory');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Team = require('../models/Team');
const { sendEmail } = require('../utils/emailService');

exports.createTicket = async (req, res) => {
    try {
        const { issueType, title, description, priority } = req.body;
        
        const ticket = await Ticket.create({
            issueType,
            title,
            description,
            priority,
            submitterId: req.user._id
        });

        // Create notification for senior officers
        const seniorOfficers = await User.find({ role: 'senior_officer' });
        
        for (const officer of seniorOfficers) {
            await Notification.create({
                userId: officer._id,
                type: 'ticket_update',
                title: 'New Ticket Created',
                message: `New ticket #${ticket.ticketId} has been created`,
                relatedId: ticket._id
            });
        }

        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            data: ticket
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

exports.getTickets = async (req, res) => {
    try {
        let query = {};
        
        // Filter based on role
        if (req.user.role === 'submitter') {
            query.submitterId = req.user._id;
        } else if (req.user.role === 'senior_officer' && req.user.teamId) {
            query.teamId = req.user.teamId;
        }
        
        // Add filters from query params
        if (req.query.status) query.status = req.query.status;
        if (req.query.priority) query.priority = req.query.priority;
        if (req.query.issueType) query.issueType = req.query.issueType;
        
        query.isDeleted = false;
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const tickets = await Ticket.find(query)
            .populate('submitterId', 'name email')
            .populate('teamId', 'teamName')
            .populate('assignedTo', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Ticket.countDocuments(query);
        
        res.json({
            success: true,
            data: tickets,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
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

exports.getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('submitterId', 'name email phoneNumber')
            .populate('teamId', 'teamName')
            .populate('assignedTo', 'name email');
        
        if (!ticket || ticket.isDeleted) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }
        
        // Check access
        if (req.user.role === 'submitter' && ticket.submitterId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        if (req.user.role === 'senior_officer' && ticket.teamId && 
            ticket.teamId._id.toString() !== req.user.teamId?.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        // Get comments
        const comments = await Comment.find({ ticketId: ticket._id })
            .populate('authorId', 'name avatarPath')
            .sort({ createdAt: 1 });
        
        // Get status history
        const history = await StatusHistory.find({ ticketId: ticket._id })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: {
                ticket,
                comments,
                history
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

exports.updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket || ticket.isDeleted) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }
        
        const { issueType, description, priority, status, teamId, assignedTo } = req.body;
        const changes = [];
        
        // Track changes for logging
        if (issueType && issueType !== ticket.issueType) {
            changes.push(`Issue type changed from ${ticket.issueType} to ${issueType}`);
            ticket.issueType = issueType;
        }
        
        if (description && description !== ticket.description) {
            changes.push('Description updated');
            ticket.description = description;
        }
        
        if (priority && priority !== ticket.priority) {
            changes.push(`Priority changed from ${ticket.priority} to ${priority}`);
            ticket.priority = priority;
        }
        
        if (status && status !== ticket.status) {
            // Create status history entry
            await StatusHistory.create({
                ticketId: ticket._id,
                userId: req.user._id,
                oldStatus: ticket.status,
                newStatus: status
            });
            
            changes.push(`Status changed from ${ticket.status} to ${status}`);
            ticket.status = status;
        }
        
        if (teamId && teamId !== ticket.teamId?.toString()) {
            const oldTeam = ticket.teamId ? await Team.findById(ticket.teamId) : null;
            const newTeam = await Team.findById(teamId);
            changes.push(`Team reassigned from ${oldTeam?.teamName || 'Unassigned'} to ${newTeam.teamName}`);
            ticket.teamId = teamId;
        }
        
        if (assignedTo && assignedTo !== ticket.assignedTo?.toString()) {
            const oldAssignee = ticket.assignedTo ? await User.findById(ticket.assignedTo) : null;
            const newAssignee = await User.findById(assignedTo);
            changes.push(`Assigned from ${oldAssignee?.name || 'Unassigned'} to ${newAssignee.name}`);
            ticket.assignedTo = assignedTo;
        }
        
        await ticket.save();
        
        // Send notification to submitter
        if (changes.length > 0) {
            const submitter = await User.findById(ticket.submitterId);
            
            await Notification.create({
                userId: ticket.submitterId,
                type: 'ticket_update',
                title: `Ticket #${ticket.ticketId} Updated`,
                message: changes.join(', '),
                relatedId: ticket._id
            });
            
            // Send email notification
            await sendEmail({
                to: submitter.email,
                subject: `Ticket #${ticket.ticketId} Updated`,
                html: `
                    <h2>Ticket Update</h2>
                    <p>Your ticket #${ticket.ticketId} has been updated:</p>
                    <ul>
                        ${changes.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                    <a href="${process.env.FRONTEND_URL}/tickets/${ticket._id}">View Ticket</a>
                `
            });
        }
        
        res.json({
            success: true,
            message: 'Ticket updated successfully',
            data: ticket,
            changes
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

exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }
        
        // Only allow deletion if status is Closed
        if (ticket.status !== 'Closed') {
            return res.status(400).json({
                success: false,
                message: 'Only closed tickets can be deleted'
            });
        }
        
        ticket.isDeleted = true;
        await ticket.save();
        
        res.json({
            success: true,
            message: 'Ticket deleted successfully'
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

exports.addComment = async (req, res) => {
    try {
        const { commentText } = req.body;
        const ticketId = req.params.id;
        
        const ticket = await Ticket.findById(ticketId);
        
        if (!ticket || ticket.isDeleted) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }
        
        const comment = await Comment.create({
            ticketId,
            authorId: req.user._id,
            commentText
        });
        
        // Populate author info
        await comment.populate('authorId', 'name avatarPath');
        
        // Notify other parties
        const notificationUsers = [];
        
        if (req.user._id.toString() !== ticket.submitterId.toString()) {
            notificationUsers.push(ticket.submitterId);
        }
        
        if (ticket.assignedTo && req.user._id.toString() !== ticket.assignedTo.toString()) {
            notificationUsers.push(ticket.assignedTo);
        }
        
        for (const userId of notificationUsers) {
            await Notification.create({
                userId,
                type: 'comment',
                title: `New comment on ticket #${ticket.ticketId}`,
                message: `${req.user.name} added a comment: ${commentText.substring(0, 100)}...`,
                relatedId: ticket._id
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: comment
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