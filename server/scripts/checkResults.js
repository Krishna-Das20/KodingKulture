import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkResults() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const results = await mongoose.connection.db.collection('results').find({}).toArray();
        console.log('Total Results:', results.length);
        console.log(JSON.stringify(results, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkResults();
