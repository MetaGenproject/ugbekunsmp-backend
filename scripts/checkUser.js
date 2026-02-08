import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'hensondemonstrationschools@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log('✅ User found:');
            console.log('ID:', user._id);
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Active:', user.isActive);
            console.log('School ID:', user.school);
        } else {
            console.log('❌ User NOT found with email:', email);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error checking user:', error);
        process.exit(1);
    }
};

checkUser();
