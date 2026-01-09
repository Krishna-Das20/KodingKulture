import mongoose from 'mongoose';

const questionTimeSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    timeSpent: {
        type: Number,
        default: 0 // in seconds
    },
    startedAt: Date,
    answeredAt: Date
});

const problemTimeSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    timeSpent: {
        type: Number,
        default: 0 // in seconds
    },
    startedAt: Date,
    submittedAt: Date
});

const contestProgressSchema = new mongoose.Schema({
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

    // Overall timing
    startedAt: {
        type: Date,
        required: true
    },
    submittedAt: Date,
    totalTimeSpent: {
        type: Number,
        default: 0 // in seconds
    },

    // MCQ Section Progress
    mcqProgress: {
        sectionStartedAt: Date,
        sectionTimeSpent: {
            type: Number,
            default: 0
        },
        questionTimes: [questionTimeSchema],
        answers: [{
            mcqId: mongoose.Schema.Types.ObjectId,
            selectedOptions: [Number]
        }]
    },

    // Coding Section Progress
    codingProgress: {
        sectionStartedAt: Date,
        sectionTimeSpent: {
            type: Number,
            default: 0
        },
        problemTimes: [problemTimeSchema]
    },

    status: {
        type: String,
        enum: ['IN_PROGRESS', 'SUBMITTED', 'TIMED_OUT'],
        default: 'IN_PROGRESS'
    },

    // Proctoring
    warningCount: {
        type: Number,
        default: 0
    },
    terminationReason: {
        type: String,
        enum: ['COMPLETED', 'TIMEOUT', 'MALPRACTICE', null],
        default: null
    },
    proctorEnabled: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Compound index for unique user-contest combination
contestProgressSchema.index({ contestId: 1, userId: 1 }, { unique: true });

const ContestProgress = mongoose.model('ContestProgress', contestProgressSchema);

export default ContestProgress;
