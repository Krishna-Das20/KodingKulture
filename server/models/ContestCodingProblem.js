import mongoose from 'mongoose';

// Junction table linking library coding problems to contests
const contestCodingProblemSchema = new mongoose.Schema({
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CodingProblem',
        required: true
    },
    // Can override library defaults for this contest
    score: {
        type: Number,
        default: null // null means use library problem's score
    },
    timeLimit: {
        type: Number,
        default: null
    },
    order: {
        type: Number,
        default: 0
    },
    // Per-contest metrics
    contestMetrics: {
        attempted: { type: Number, default: 0 },
        accepted: { type: Number, default: 0 },
        wrongAnswer: { type: Number, default: 0 },
        tle: { type: Number, default: 0 },
        runtimeError: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Ensure unique problem per contest
contestCodingProblemSchema.index({ contestId: 1, problemId: 1 }, { unique: true });
contestCodingProblemSchema.index({ contestId: 1, order: 1 });

const ContestCodingProblem = mongoose.model('ContestCodingProblem', contestCodingProblemSchema);

export default ContestCodingProblem;
