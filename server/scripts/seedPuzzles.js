import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MCQ from '../models/MCQ.js';
import User from '../models/User.js';

dotenv.config();

const questions = [
    {
        question: 'A king is hosting a grand celebration that will begin in 10 hours. For the occasion, he has imported 1,000 bottles of wine. Unfortunately, he has learned that exactly one bottle is poisoned.\nThe poison has a unique property:\nIt causes death exactly 10 hours after consumption — not earlier, not later.\nThe king has access to as many prisoners as needed for testing. A prisoner may drink from multiple bottles if required.\nSince the party begins in 10 hours, the king has only one opportunity to conduct the test.\nQuestion:\nWhat is the minimum number of prisoners required to guarantee identification of the poisoned bottle before the party begins?',
        options: [
            { text: '9', isCorrect: false },
            { text: '12', isCorrect: false },
            { text: '10', isCorrect: true },
            { text: '999', isCorrect: false }
        ],
        correctAnswers: [2],
        explanation: 'It requires 10 prisoners because 2^10 = 1024, which allows encoding the 1000 bottles in binary. Each prisoner represents a bit in the binary representation of the bottle number.',
        difficulty: 'HARD',
        tags: ['puzzles', 'logic', 'binary']
    },
    {
        question: 'The 100 Doors and 100 Monkeys Problem\nThere are 100 closed doors in a row, all initially closed.\nThere are 100 monkeys (or people).\nThey pass the doors in the following way:\nThe 1st monkey opens every door.\nThe 2nd monkey toggles every 2nd door (closes 2, opens 4, closes 6…).\nThe 3rd monkey toggles every 3rd door.\nThe 4th monkey toggles every 4th door.\n...\nThe 100th monkey toggles only the 100th door.\n(Toggling means: open → close, close → open.)\nQuestion:\nAfter all 100 monkeys have passed, which doors remain open?',
        options: [
            { text: 'Only the doors that are perfect squares (1, 4, 9, 16...)', isCorrect: true },
            { text: 'All prime numbered doors', isCorrect: false },
            { text: 'All even numbered doors', isCorrect: false },
            { text: 'Only the 100th door', isCorrect: false }
        ],
        correctAnswers: [0],
        explanation: 'A door is toggled for every factor it has. For example, door 12 is toggled by monkeys 1, 2, 3, 4, 6, 12 (6 times, an even number, so it ends up closed). Only perfect squares have an odd number of factors, so they end up open.',
        difficulty: 'MEDIUM',
        tags: ['puzzles', 'logic', 'math']
    },
    {
        question: 'A man must pay a worker 1 kg of gold per day for 7 days.\nHe has a single 7 kg gold bar.\nRules:\nHe can cut the gold bar only twice.\nHe must pay exactly 1 kg per day.\nHe can give and take back pieces as change.\nQuestion:\nHow should he cut the gold bar to make the payments possible?',
        options: [
            { text: 'Cut it into pieces of 1 kg, 1 kg, and 5 kg', isCorrect: false },
            { text: 'Cut it into pieces of 1.5 kg, 2.5 kg, and 3 kg', isCorrect: false },
            { text: 'Cut it into pieces of 2 kg, 2 kg, and 3 kg', isCorrect: false },
            { text: 'Cut it into pieces of 1 kg, 2 kg, and 4 kg', isCorrect: true }
        ],
        correctAnswers: [3],
        explanation: 'With cuts of 1, 2, and 4 (powers of 2), you can form any number from 1 to 7 using combinations (like binary counting): Day 1: give 1. Day 2: give 2, take 1. Day 3: give 1. Day 4: give 4, take 1 and 2. Day 5: give 1. Day 6: give 2, take 1. Day 7: give 1.',
        difficulty: 'MEDIUM',
        tags: ['puzzles', 'logic']
    },
    {
        question: 'Four people need to cross a narrow bridge at night.\nRules:\nThey have only one torch.\nAt most two people can cross at a time.\nEach person walks at a different speed:\nPerson A: 1 minute\nPerson B: 2 minutes\nPerson C: 5 minutes\nPerson D: 10 minutes\nWhen two people cross together, they move at the slower person’s pace.\nThe torch must be carried back and forth; it cannot be thrown.\nQuestion:\nWhat is the minimum total time required for all four people to cross the bridge?',
        options: [
            { text: '19 minutes', isCorrect: false },
            { text: '17 minutes', isCorrect: true },
            { text: '21 minutes', isCorrect: false },
            { text: '18 minutes', isCorrect: false }
        ],
        correctAnswers: [1],
        explanation: 'A&B cross (2m), A returns (1m), C&D cross (10m), B returns (2m), A&B cross (2m). Total = 2 + 1 + 10 + 2 + 2 = 17 mins. The trick is sending the two slowest people together so their times don\'t add up.',
        difficulty: 'MEDIUM',
        tags: ['puzzles', 'logic', 'optimization']
    },
    {
        question: 'You are given:\nA 100-floor building\n2 identical eggs\nThere exists a floor F (1 ≤ F ≤ 100) such that:\nDropping an egg from floor F or above will break it.\nDropping an egg from any floor below F will not break it.\nIf an egg breaks, it cannot be used again.\nIf it does not break, it can be reused.\nYour task is to determine the value of F using the minimum number of egg drops in the worst case.\nQuestion:\nWhat is the minimum number of drops required to guarantee finding F, regardless of its value?',
        options: [
            { text: '10', isCorrect: false },
            { text: '14', isCorrect: true },
            { text: '12', isCorrect: false },
            { text: '50', isCorrect: false }
        ],
        correctAnswers: [1],
        explanation: 'The first drop should be at floor x, then x-1, x-2, etc. This maintains the same worst-case maximum drops. The equation x + (x-1) + (x-2) ... + 1 >= 100 gives x*(x+1)/2 >= 100, which solves to x = 14.',
        difficulty: 'HARD',
        tags: ['puzzles', 'logic', 'optimization']
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find the production admin by email
        const admin = await User.findOne({ email: 'krishnadas2806@gmail.com' });
        if (!admin) {
            console.error('❌ Admin user krishnadas2806@gmail.com not found in the database.');
            process.exit(1);
        }
        console.log(`📌 Using admin: ${admin.name} (${admin.email})`);

        const existingCount = await MCQ.countDocuments({ category: 'APTITUDE' });

        const mcqDocs = questions.map((q, i) => ({
            ...q,
            isLibrary: true,
            isPublic: true,
            category: 'APTITUDE',
            marks: 4,
            negativeMarks: 0,
            createdBy: admin._id,
            order: existingCount + i + 1
        }));

        const result = await MCQ.insertMany(mcqDocs);
        console.log(`\n🎉 Successfully inserted ${result.length} puzzle MCQs!\n`);

        result.forEach((mcq, i) => {
            console.log(`  ${i + 1}. ${mcq.question.substring(0, 60)}... [${mcq._id}]`);
        });

        console.log('\nDone!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seed();
