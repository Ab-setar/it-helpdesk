const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    oldStatus: {
        type: String,
        enum: ['Open', 'In Progress', 'Closed']
    },
    newStatus: {
        type: String,
        enum: ['Open', 'In Progress', 'Closed'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StatusHistory', statusHistorySchema);