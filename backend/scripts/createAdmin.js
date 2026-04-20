require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // Check if admin already exists
        const existing = await User.findOne({ email: 'admin@helpdesk.com' });
        if (existing) {
            console.log('Admin already exists! Email: admin@helpdesk.com');
            process.exit(0);
        }

        // Create admin — password will be hashed automatically by the User model
        await User.create({
            name: 'Admin User',
            email: 'admin@helpdesk.com',
            password: 'Admin@1234',
            role: 'admin',
            isActive: true,
            preferences: { theme: 'light', language: 'en' }
        });

        console.log('');
        console.log('✅ Admin created successfully!');
        console.log('----------------------------');
        console.log('Email   : admin@helpdesk.com');
        console.log('Password: Admin@1234');
        console.log('----------------------------');
        console.log('Please change the password after first login.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
