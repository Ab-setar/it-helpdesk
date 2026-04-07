const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Team = require('../models/Team');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Clear existing data
        await User.deleteMany({});
        await Team.deleteMany({});
        
        // Create teams
        const teams = await Team.insertMany([
            { teamName: 'Hardware Support', description: 'Hardware related issues' },
            { teamName: 'Software Support', description: 'Software related issues' },
            { teamName: 'Network Operations', description: 'Network related issues' },
            { teamName: 'Security Team', description: 'Security and access issues' },
            { teamName: 'Other Issues Team', description: 'General issues' }
        ]);
        
        console.log('Teams created');
        
        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            name: 'Admin User',
            email: 'admin@helpdesk.com',
            password: adminPassword,
            role: 'admin'
        });
        
        console.log('Admin user created');
        console.log('Email: admin@helpdesk.com');
        console.log('Password: admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();