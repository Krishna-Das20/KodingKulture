import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixResultStatus() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const ContestProgress = (await import('../models/ContestProgress.js')).default;

        // Find all submitted contest progress
        const submittedProgress = await ContestProgress.find({ status: 'SUBMITTED' });
        console.log(`Found ${submittedProgress.length} submitted contests`);

        // Update matching Result records to SUBMITTED status
        for (const progress of submittedProgress) {
            const result = await mongoose.connection.db.collection('results').updateOne(
                {
                    contestId: progress.contestId,
                    userId: progress.userId
                },
                {
                    $set: {
                        status: 'SUBMITTED',
                        submittedAt: progress.submittedAt,
                        startedAt: progress.startedAt,
                        timeTaken: progress.totalTimeSpent || 0
                    }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`Updated Result for contest ${progress.contestId}`);
            }
        }

        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixResultStatus();
