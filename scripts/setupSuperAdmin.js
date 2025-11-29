import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

const setupSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://ugbekun:ugbekunsmp%402025@ugbekun.6xeplrg.mongodb.net/?appName=Ugbekun' );
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super-admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await User.create({
      email: 'superadmin@ugbekun.com',
      password: 'Admin@2025', // Change this password
      role: 'super-admin'
    });

    console.log('Super admin created successfully:', superAdmin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error setting up super admin:', error);
    process.exit(1);
  }
};

setupSuperAdmin();