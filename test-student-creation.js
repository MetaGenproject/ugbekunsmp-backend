import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/studentModel.js';

dotenv.config();

const testCreateStudent = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const testStudent = {
            name: 'Test Student',
            class: 'JSS 1',
            initials: 'TS',
            dateOfBirth: new Date('2010-01-01'),
            gender: 'Male',
            parentName: 'Test Parent',
            parentPhone: '1234567890',
            address: 'Test Address',
            studentId: 'UC-TEST-001'
        };

        const student = new Student(testStudent);
        const saved = await student.save();
        console.log('Student saved successfully:', saved._id);

        await Student.findByIdAndDelete(saved._id);
        console.log('Test student cleaned up');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error during student creation dry-run:', error);
    }
};

testCreateStudent();
