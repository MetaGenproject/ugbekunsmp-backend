import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import Student from './models/studentModel.js';
import Event from './models/eventModel.js';
import Transaction from './models/transactionModel.js';
import School from './models/schoolModel.js';

dotenv.config();

const verifyStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find an admin with a school
        const admin = await User.findOne({ role: 'admin', school: { $exists: true } }).populate('school');

        if (!admin || !admin.school) {
            console.log('No admin with a school found for testing.');
            process.exit(0);
        }

        const schoolId = admin.school._id;
        console.log(`Testing with School: ${admin.school.schoolName} (${schoolId})`);

        // Insert some test data if needed
        const existingEvents = await Event.countDocuments({ school: schoolId });
        if (existingEvents === 0) {
            console.log('Inserting test event...');
            await Event.create({
                title: 'Test Sports Day',
                date: new Date(),
                school: schoolId,
                description: 'A fun sports day for everyone!'
            });
        }

        const existingTransactions = await Transaction.countDocuments({ school: schoolId });
        if (existingTransactions === 0) {
            console.log('Inserting test transaction...');
            await Transaction.create({
                amount: 500000,
                type: 'revenue',
                status: 'completed',
                school: schoolId,
                description: 'School Fees'
            });
        }

        // Now check the counts again
        const [studentsCount, teachersCount, totalUsers, revenueResult, eventsCount] = await Promise.all([
            Student.countDocuments({ school: schoolId }),
            User.countDocuments({ school: schoolId, role: 'teacher' }),
            User.countDocuments({ school: schoolId }),
            Transaction.aggregate([
                { $match: { school: schoolId, type: 'revenue', status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Event.countDocuments({ school: schoolId })
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        console.log('Verification Results:');
        console.log(`- Students: ${studentsCount}`);
        console.log(`- Teachers: ${teachersCount}`);
        console.log(`- Total Users: ${totalUsers}`);
        console.log(`- Total Revenue: ₦${totalRevenue}`);
        console.log(`- Events: ${eventsCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Error during verification:', error);
        process.exit(1);
    }
};

verifyStats();
