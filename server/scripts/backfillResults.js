import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function backfillResults() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const ContestProgress = (await import('../models/ContestProgress.js')).default;
        const Result = (await import('../models/Result.js')).default;
        const MCQ = (await import('../models/MCQ.js')).default;
        const Submission = (await import('../models/Submission.js')).default;

        // Find all submitted contests without Result records
        const submittedProgress = await ContestProgress.find({ status: 'SUBMITTED' });
        console.log(`Found ${submittedProgress.length} submitted contest progress records`);

        let created = 0;
        let skipped = 0;

        for (const progress of submittedProgress) {
            // Check if Result already exists
            const existingResult = await Result.findOne({
                contestId: progress.contestId,
                userId: progress.userId
            });

            if (existingResult) {
                skipped++;
                continue;
            }

            // Calculate MCQ Score
            let mcqScore = 0;
            const mcqAnswerDetails = [];
            const mcqAnswers = progress.mcqProgress?.answers || [];

            for (const answer of mcqAnswers) {
                const mcq = await MCQ.findById(answer.mcqId);
                if (mcq) {
                    const correctAnswers = mcq.options
                        .map((opt, idx) => opt.isCorrect ? idx : -1)
                        .filter(idx => idx !== -1);

                    const userAnswers = answer.selectedOptions || [];
                    const isCorrect = userAnswers.length === correctAnswers.length &&
                        userAnswers.every(ans => correctAnswers.includes(ans));

                    const marksAwarded = isCorrect ? (mcq.marks || 1) : -(mcq.negativeMarks || 0);
                    mcqScore += marksAwarded;

                    mcqAnswerDetails.push({
                        questionId: mcq._id,
                        selectedOptions: userAnswers,
                        isCorrect,
                        marksAwarded
                    });
                }
            }

            // Calculate Coding Score
            let codingScore = 0;
            const codingSubmissionDetails = [];
            const userSubmissions = await Submission.find({
                userId: progress.userId,
                contestId: progress.contestId,
                verdict: 'ACCEPTED'
            });

            const problemScores = {};
            for (const sub of userSubmissions) {
                const problemId = sub.problemId.toString();
                if (!problemScores[problemId] || sub.score > problemScores[problemId].score) {
                    problemScores[problemId] = sub;
                }
            }

            for (const [problemId, sub] of Object.entries(problemScores)) {
                codingScore += sub.score || 0;
                codingSubmissionDetails.push({
                    problemId: sub.problemId,
                    bestSubmission: sub._id,
                    score: sub.score || 0,
                    solved: true
                });
            }

            const totalScore = mcqScore + codingScore;
            const timeTaken = progress.totalTimeSpent ||
                Math.floor((progress.submittedAt - progress.startedAt) / 1000);

            // Create Result record
            await Result.create({
                contestId: progress.contestId,
                userId: progress.userId,
                mcqScore,
                mcqAnswers: mcqAnswerDetails,
                codingScore,
                codingSubmissions: codingSubmissionDetails,
                totalScore,
                timeTaken,
                startedAt: progress.startedAt,
                submittedAt: progress.submittedAt,
                status: 'SUBMITTED'
            });

            created++;
            console.log(`Created Result for user ${progress.userId} in contest ${progress.contestId}`);
        }

        console.log(`\n✅ Done! Created ${created} Result records, skipped ${skipped} (already existed)`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

backfillResults();
