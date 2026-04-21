require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('../models/Team');

const defaultTeams = [
    { teamName: 'Hardware', description: 'Handles hardware issues — computers, printers, peripherals' },
    { teamName: 'Software', description: 'Handles software issues — applications, OS, installations' },
    { teamName: 'Network', description: 'Handles network issues — internet, LAN, VPN, connectivity' },
    { teamName: 'Account Access', description: 'Handles account and access issues — passwords, permissions' },
    { teamName: 'Other', description: 'General IT support issues' },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        for (const team of defaultTeams) {
            const exists = await Team.findOne({ teamName: team.teamName });
            if (!exists) {
                await Team.create(team);
                console.log(`✅ Created team: ${team.teamName}`);
            } else {
                console.log(`⏭  Already exists: ${team.teamName}`);
            }
        }

        console.log('\nDone! Teams are ready.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

seed();
