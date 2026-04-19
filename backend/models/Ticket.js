const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true
    },
    issueType: {
        type: String,
        required: [true, 'Issue type is required'],
        enum: ['Hardware', 'Software', 'Network', 'Account Access', 'Other']
    },
    title: {
        type: String,
        trim: true,
        default: ''
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Closed'],
        default: 'Open'
    },
    submitterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    attachments: [{
        fileName: String,
        filePath: String,
        fileSize: Number,
        mimeType: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for common query patterns
ticketSchema.index({ submitterId: 1, status: 1 });   // submitter filtering their tickets by status
ticketSchema.index({ teamId: 1, status: 1 });         // senior officer filtering team tickets by status
ticketSchema.index({ isDeleted: 1, createdAt: -1 });  // default listing sorted by newest
ticketSchema.index({ status: 1, isDeleted: 1 });      // admin filtering all tickets by status

// Generate a unique ticket ID atomically before saving
ticketSchema.pre('save', async function (next) {
    if (!this.ticketId) {
        const Counter = require('./Counter');
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const seq = await Counter.getNext('ticket');
        this.ticketId = `TKT-${year}${month}-${seq.toString().padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);