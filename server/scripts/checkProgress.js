import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkProgress() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const progress = await mongoose.connection.db.collection('contestprogresses').find({ status: 'SUBMITTED' }).toArray();
        console.log('Submitted Contest Progress Records:', progress.length);

        if (progress.length > 0) {
            console.log('\nFirst record sample:');
            console.log('MCQ Progress:', JSON.stringify(progress[0].mcqProgress, null, 2));
            console.log('Coding Progress:', JSON.stringify(progress[0].codingProgress, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkProgress();
