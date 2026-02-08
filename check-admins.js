import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import './models/schoolModel.js';

dotenv.config();

const checkStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ role: 'admin' }).populate('school');
        console.log('--- Admins and School IDs ---');
        users.forEach(u => {
            console.log(`Email: ${u.email}`);
            console.log(`School Name: ${u.school?.schoolName}`);
            console.log(`School ID: ${u.school?._id}`);
            console.log('-------------------------');
        });
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkStatus();
