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

// Generate ticket ID before saving
ticketSchema.pre('save', async function(next) {
    if (!this.ticketId) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const count = await mongoose.model('Ticket').countDocuments();
        this.ticketId = `TKT-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);