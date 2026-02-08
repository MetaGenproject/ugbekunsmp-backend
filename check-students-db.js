import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/studentModel.js';
import './models/schoolModel.js'; // Register School model

dotenv.config();

const checkStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const students = await Student.find().populate('school', 'schoolName');
        console.log(`Total students in DB: ${students.length}`);

        students.forEach(s => {
            console.log(`- ${s.name} (${s.class}) - School: ${s.school?.schoolName || 'None'} (ID: ${s.school?._id || 'None'})`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkStudents();
