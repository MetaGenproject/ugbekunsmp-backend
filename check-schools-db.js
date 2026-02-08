import mongoose from 'mongoose';
import dotenv from 'dotenv';
import School from './models/schoolModel.js';

dotenv.config();

const checkSchools = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const schools = await School.find();
        console.log('--- Schools in DB ---');
        schools.forEach(s => {
            console.log(`ID: ${s._id}`);
            console.log(`Name: ${s.schoolName}`);
            console.log('-------------------------');
        });
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkSchools();
