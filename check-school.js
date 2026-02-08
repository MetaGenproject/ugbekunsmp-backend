import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const findSchool = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const school = await mongoose.connection.db.collection('schools').findOne({ _id: new mongoose.Types.ObjectId('692b19084e4e6ac3ac3a55a3') });
        console.log('School found:', school?.schoolName || 'Not Found');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

findSchool();
