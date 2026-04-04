const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: [true, 'Team name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);