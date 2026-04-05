const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
};

const seniorOfficerOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'senior_officer')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Senior officer or admin only.'
        });
    }
};

const checkTeamAccess = async (req, res, next) => {
    try {
        const Ticket = require('../models/Ticket');
        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }
        
        // Admin has full access
        if (req.user.role === 'admin') {
            req.ticket = ticket;
            return next();
        }
        
        // Senior officer can only access tickets from their team
        if (req.user.role === 'senior_officer') {
            if (ticket.teamId && ticket.teamId.toString() === req.user.teamId?.toString()) {
                req.ticket = ticket;
                return next();
            }
            return res.status(403).json({
                success: false,
                message: 'You can only access tickets from your team'
            });
        }
        
        // Submitter can only access their own tickets
        if (req.user.role === 'submitter') {
            if (ticket.submitterId.toString() === req.user._id.toString()) {
                req.ticket = ticket;
                return next();
            }
            return res.status(403).json({
                success: false,
                message: 'You can only access your own tickets'
            });
        }
        
        res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { protect, adminOnly, seniorOfficerOnly, checkTeamAccess };