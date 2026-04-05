const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    commentText: {
        type: String,
        required: [true, 'Comment text is required'],
        trim: true
    },
    isInternal: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);