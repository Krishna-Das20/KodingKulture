import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true
    },
    type: {
        type: String,
        enum: ['TAB_SWITCH', 'FULLSCREEN_EXIT', 'WINDOW_BLUR', 'COPY_ATTEMPT', 'PASTE_ATTEMPT', 'SCREENSHOT_ATTEMPT'],
        required: true
    },
    warningNumber: {
        type: Number,
        required: true
    },
    details: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
violationSchema.index({ userId: 1, contestId: 1 });
violationSchema.index({ contestId: 1, timestamp: -1 });

const Violation = mongoose.model('Violation', violationSchema);

export default Violation;
