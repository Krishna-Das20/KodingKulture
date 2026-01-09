import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Contest model
const contestSchema = new mongoose.Schema({
    title: String,
    description: String,
    startTime: Date,
    endTime: Date,
    duration: Number,
    status: String,
    isPublished: Boolean,
    sections: {
        mcq: { enabled: Boolean, totalMarks: Number },
        coding: { enabled: Boolean, totalMarks: Number }
    },
    rules: [String],
    participants: [mongoose.Schema.Types.ObjectId],
    createdBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const Contest = mongoose.model('Contest', contestSchema);

// User model for getting admin
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
});
const User = mongoose.model('User', userSchema);

async function createContest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get admin user
        const admin = await User.findOne({ role: 'ADMIN' });
        if (!admin) {
            console.error('No admin user found!');
            process.exit(1);
        }

        // Contest times for Jan 6, 2026
        // 12:40 PM IST = 07:10 UTC
        // 2:40 PM IST = 09:10 UTC
        const startTime = new Date('2026-01-06T07:10:00.000Z');
        const endTime = new Date('2026-01-06T09:10:00.000Z');
        const duration = 120; // 2 hours = 120 minutes

        const contest = await Contest.create({
            title: 'FAKT CHECK Challenge #1',
            description: 'Test your coding and MCQ skills in this 2-hour challenge!',
            startTime,
            endTime,
            duration,
            status: 'LIVE', // Since start time has passed
            isPublished: true,
            sections: {
                mcq: { enabled: true, totalMarks: 100 },
                coding: { enabled: true, totalMarks: 400 }
            },
            rules: [
                'No plagiarism allowed',
                'You cannot use external resources',
                'Timer starts when you click Start Contest',
                'All answers are auto-submitted when timer ends'
            ],
            participants: [],
            createdBy: admin._id
        });

        console.log('✅ Contest created successfully!');
        console.log('Title:', contest.title);
        console.log('Start:', contest.startTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
        console.log('End:', contest.endTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
        console.log('Duration:', contest.duration, 'minutes');
        console.log('ID:', contest._id);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createContest();
