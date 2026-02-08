import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'hensondemonstrationschools@gmail.com';
        const newPassword = 'henson2025';

        const user = await User.findOne({ email });

        if (user) {
            user.password = newPassword;
            await user.save();
            console.log(`✅ Password for ${email} has been reset to: ${newPassword}`);
        } else {
            console.log('❌ User NOT found with email:', email);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error resetting password:', error);
        process.exit(1);
    }
};

resetPassword();
