import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const testApiCreation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('No admin user found');
            return;
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        console.log('Valid Admin Token:', token);
        console.log('Admin ID:', admin._id);
        console.log('Admin School:', admin.school);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

testApiCreation();
