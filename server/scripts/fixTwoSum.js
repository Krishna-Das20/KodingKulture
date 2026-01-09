import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixTwoSum() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await mongoose.connection.db.collection('codingproblems').updateOne(
            { title: 'Two Sum', isLibrary: true },
            {
                $set: {
                    inputFormat: 'First line: n (number of elements)\nSecond line: n space-separated integers\nThird line: target sum',
                    outputFormat: 'Two space-separated integers representing the indices of the two numbers'
                }
            }
        );

        console.log('✅ Two Sum updated:', result.modifiedCount, 'document(s) modified');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixTwoSum();
