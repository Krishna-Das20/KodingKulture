import mongoose from 'mongoose';

const mcqSubmissionSchema = new mongoose.Schema({
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
        mcqId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MCQ'
        },
        selectedOptions: [Number], // Array of selected option indices
        timeSpent: { type: Number, default: 0 } // Time spent on this question in seconds
    }],
    score: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        default: 0
    },
    correctAnswers: {
        type: Number,
        default: 0
    },
    wrongAnswers: {
        type: Number,
        default: 0
    },
    unanswered: {
        type: Number,
        default: 0
    },
    totalTimeSpent: {
        type: Number,
        default: 0 // Total time spent on MCQ section in seconds
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for unique contest-user combination
mcqSubmissionSchema.index({ contestId: 1, userId: 1 }, { unique: true });

export default mongoose.model('MCQSubmission', mcqSubmissionSchema);
