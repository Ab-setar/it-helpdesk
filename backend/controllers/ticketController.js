const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const StatusHistory = require('../models/StatusHistory');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Team = require('../models/Team');
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

exports.createTicket = async (req, res) => {
    try {
        const { issueType, title, description, priority } = req.body;

        const ticket = await Ticket.create({
            issueType, title, description, priority,
            submitterId: req.user._id
        });

        // Notify all senior officers in a single DB operation
        const seniorOfficers = await User.find({ role: 'senior_officer' }).select('_id');
        if (seniorOfficers.length > 0) {
            await Notification.insertMany(seniorOfficers.map(officer => ({
                userId: officer._id,
                type: 'ticket_update',
                title: 'New Ticket Created',
                message: `New ticket #${ticket.ticketId} has been created`,
                relatedId: ticket._id
            })));
        }

        res.status(201).json({ success: true, message: 'Ticket created successfully', data: ticket });
    } catch (error) {
        serverError(res, error);
    }
};

exports.getTickets = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'submitter') {
            query.submitterId = req.user._id;
        } else if (req.user.role === 'senior_officer' && req.user.teamId) {
            query.teamId = req.user.teamId;
        }

        if (req.query.status) query.status = req.query.status;
        if (req.query.priority) query.priority = req.query.priority;
        if (req.query.issueType) query.issueType = req.query.issueType;
        query.isDeleted = false;

        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100); // cap at 100
        const skip = (page - 1) * limit;

        // Run both queries in parallel
        const [tickets, total] = await Promise.all([
            Ticket.find(query)
                .populate('submitterId', 'name email')
                .populate('teamId', 'teamName')
                .populate('assignedTo', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Ticket.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: tickets,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        serverError(res, error);
    }
};

exports.getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('submitterId', 'name email phoneNumber')
            .populate('teamId', 'teamName')
            .populate('assignedTo', 'name email');

        if (!ticket || ticket.isDeleted) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Access control
        if (req.user.role === 'submitter' &&
            ticket.submitterId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (req.user.role === 'senior_officer' && ticket.teamId &&
            ticket.teamId._id.toString() !== req.user.teamId?.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Fetch comments and history in parallel
        const [comments, history] = await Promise.all([
            Comment.find({ ticketId: ticket._id })
                .populate('authorId', 'name avatarPath')
                .sort({ createdAt: 1 }),
            StatusHistory.find({ ticketId: ticket._id })
                .populate('userId', 'name')
                .sort({ createdAt: -1 })
        ]);

        res.json({ success: true, data: { ticket, comments, history } });
    } catch (error) {
        serverError(res, error);
    }
};

exports.updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket || ticket.isDeleted) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        const { issueType, description, priority, status, teamId, assignedTo } = req.body;
        const changes = [];

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
            const newTeam = await Team.findById(teamId);
            if (!newTeam) {
                return res.status(400).json({ success: false, message: 'Team not found' });
            }
            const oldTeam = ticket.teamId ? await Team.findById(ticket.teamId) : null;
            changes.push(`Team reassigned from ${oldTeam?.teamName || 'Unassigned'} to ${newTeam.teamName}`);
            ticket.teamId = teamId;
        }

        if (assignedTo && assignedTo !== ticket.assignedTo?.toString()) {
            const newAssignee = await User.findById(assignedTo);
            if (!newAssignee) {
                return res.status(400).json({ success: false, message: 'Assigned user not found' });
            }
            const oldAssignee = ticket.assignedTo ? await User.findById(ticket.assignedTo) : null;
            changes.push(`Assigned from ${oldAssignee?.name || 'Unassigned'} to ${newAssignee.name}`);
            ticket.assignedTo = assignedTo;
        }

        await ticket.save();

        if (changes.length > 0) {
            const submitter = await User.findById(ticket.submitterId);

            // Notification and email run in parallel, email is fire-and-forget
            await Notification.create({
                userId: ticket.submitterId,
                type: 'ticket_update',
                title: `Ticket #${ticket.ticketId} Updated`,
                message: changes.join(', '),
                relatedId: ticket._id
            });

            // Fire-and-forget — don't block response on email
            sendEmail({
                to: submitter.email,
                subject: `Ticket #${ticket.ticketId} Updated`,
                html: `
                    <h2>Ticket Update</h2>
                    <p>Your ticket #${ticket.ticketId} has been updated:</p>
                    <ul>${changes.map(c => `<li>${c}</li>`).join('')}</ul>
                    <a href="${process.env.FRONTEND_URL}/tickets/${ticket._id}">View Ticket</a>
                `
            }).catch(err => console.error('Email failed:', err.message));
        }

        res.json({ success: true, message: 'Ticket updated successfully', data: ticket, changes });
    } catch (error) {
        serverError(res, error);
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Ownership check — submitters can only delete their own tickets
        if (req.user.role === 'submitter' &&
            ticket.submitterId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (ticket.status !== 'Closed') {
            return res.status(400).json({ success: false, message: 'Only closed tickets can be deleted' });
        }

        ticket.isDeleted = true;
        await ticket.save();

        res.json({ success: true, message: 'Ticket deleted successfully' });
    } catch (error) {
        serverError(res, error);
    }
};

exports.addComment = async (req, res) => {
    try {
        const { commentText } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket || ticket.isDeleted) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        const comment = await Comment.create({
            ticketId: req.params.id,
            authorId: req.user._id,
            commentText
        });

        await comment.populate('authorId', 'name avatarPath');

        // Build notification list
        const notificationUsers = [];
        if (req.user._id.toString() !== ticket.submitterId.toString()) {
            notificationUsers.push(ticket.submitterId);
        }
        if (ticket.assignedTo && req.user._id.toString() !== ticket.assignedTo.toString()) {
            notificationUsers.push(ticket.assignedTo);
        }

        if (notificationUsers.length > 0) {
            const preview = commentText.length > 100
                ? `${commentText.substring(0, 100)}...`
                : commentText;

            await Notification.insertMany(notificationUsers.map(userId => ({
                userId,
                type: 'comment',
                title: `New comment on ticket #${ticket.ticketId}`,
                message: `${req.user.name} added a comment: ${preview}`,
                relatedId: ticket._id
            })));
        }

        res.status(201).json({ success: true, message: 'Comment added successfully', data: comment });
    } catch (error) {
        serverError(res, error);
    }
};
