import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const listAllCollections = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in Database:');
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error listing collections:', error);
    }
};

listAllCollections();
