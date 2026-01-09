import mongoose from 'mongoose';

// Junction table linking library MCQs to contests
const contestMCQSchema = new mongoose.Schema({
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true
    },
    mcqId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MCQ',
        required: true
    },
    // Can override library defaults for this contest
    marks: {
        type: Number,
        default: null // null means use library MCQ's marks
    },
    negativeMarks: {
        type: Number,
        default: null
    },
    order: {
        type: Number,
        default: 0
    },
    // Per-contest metrics for this MCQ
    contestMetrics: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        wrong: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Ensure unique MCQ per contest
contestMCQSchema.index({ contestId: 1, mcqId: 1 }, { unique: true });
contestMCQSchema.index({ contestId: 1, order: 1 });

const ContestMCQ = mongoose.model('ContestMCQ', contestMCQSchema);

export default ContestMCQ;
