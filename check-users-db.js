import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import './models/schoolModel.js'; // Register School model

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find().populate('school', 'schoolName');
        console.log('--- Users and Schools ---');
        users.forEach(u => {
            console.log(`Email: ${u.email}`);
            console.log(`Role: ${u.role}`);
            console.log(`School: ${u.school?.schoolName || 'None'}`);
            console.log('-------------------------');
        });
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkUsers();
