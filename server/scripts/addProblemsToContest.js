import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MCQ Schema
const mcqSchema = new mongoose.Schema({
    contestId: mongoose.Schema.Types.ObjectId,
    question: String,
    options: [{ text: String, isCorrect: Boolean }],
    explanation: String,
    marks: Number,
    order: Number
}, { timestamps: true });

const MCQ = mongoose.model('MCQ', mcqSchema);

// CodingProblem Schema
const codingProblemSchema = new mongoose.Schema({
    contestId: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    inputFormat: String,
    outputFormat: String,
    constraints: String,
    examples: [{ input: String, output: String, explanation: String }],
    testCases: [{ input: String, output: String, isHidden: Boolean, points: Number }],
    difficulty: String,
    score: Number,
    timeLimit: Number,
    memoryLimit: Number,
    tags: [String],
    order: Number
}, { timestamps: true });

const CodingProblem = mongoose.model('CodingProblem', codingProblemSchema);

const CONTEST_ID = '695cb785164f193b6e098bdd'; // From the created contest

async function addProblems() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // ===== 5 MCQ Questions =====
        const mcqs = [
            {
                contestId: CONTEST_ID,
                question: 'What is the time complexity of binary search?',
                options: [
                    { text: 'O(n)', isCorrect: false },
                    { text: 'O(log n)', isCorrect: true },
                    { text: 'O(n²)', isCorrect: false },
                    { text: 'O(1)', isCorrect: false }
                ],
                explanation: 'Binary search divides the search space in half each time, resulting in O(log n) complexity.',
                marks: 20,
                order: 1
            },
            {
                contestId: CONTEST_ID,
                question: 'Which data structure uses LIFO (Last In First Out) principle?',
                options: [
                    { text: 'Queue', isCorrect: false },
                    { text: 'Stack', isCorrect: true },
                    { text: 'Array', isCorrect: false },
                    { text: 'Linked List', isCorrect: false }
                ],
                explanation: 'Stack follows LIFO - the last element pushed is the first one to be popped.',
                marks: 20,
                order: 2
            },
            {
                contestId: CONTEST_ID,
                question: 'What does SQL stand for?',
                options: [
                    { text: 'Structured Query Language', isCorrect: true },
                    { text: 'Simple Question Language', isCorrect: false },
                    { text: 'Standard Query Logic', isCorrect: false },
                    { text: 'System Query Language', isCorrect: false }
                ],
                explanation: 'SQL stands for Structured Query Language, used to manage relational databases.',
                marks: 20,
                order: 3
            },
            {
                contestId: CONTEST_ID,
                question: 'Which of the following is NOT a JavaScript framework?',
                options: [
                    { text: 'React', isCorrect: false },
                    { text: 'Angular', isCorrect: false },
                    { text: 'Django', isCorrect: true },
                    { text: 'Vue', isCorrect: false }
                ],
                explanation: 'Django is a Python web framework, not a JavaScript framework.',
                marks: 20,
                order: 4
            },
            {
                contestId: CONTEST_ID,
                question: 'What is the output of: console.log(typeof null)?',
                options: [
                    { text: '"null"', isCorrect: false },
                    { text: '"undefined"', isCorrect: false },
                    { text: '"object"', isCorrect: true },
                    { text: '"boolean"', isCorrect: false }
                ],
                explanation: 'This is a well-known JavaScript quirk - typeof null returns "object" due to a legacy bug.',
                marks: 20,
                order: 5
            }
        ];

        await MCQ.insertMany(mcqs);
        console.log('✅ 5 MCQs added successfully!');

        // ===== 2 Coding Problems =====
        const codingProblems = [
            {
                contestId: CONTEST_ID,
                title: 'Two Sum',
                description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
                inputFormat: 'First line: n (number of elements)\nSecond line: n space-separated integers\nThird line: target sum',
                outputFormat: 'Two space-separated indices (0-indexed)',
                constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
                examples: [
                    { input: '4\n2 7 11 15\n9', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
                    { input: '3\n3 2 4\n6', output: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' }
                ],
                testCases: [
                    { input: '4\n2 7 11 15\n9', output: '0 1', isHidden: false, points: 50 },
                    { input: '3\n3 2 4\n6', output: '1 2', isHidden: false, points: 50 },
                    { input: '5\n1 5 3 8 2\n10', output: '2 3', isHidden: true, points: 50 },
                    { input: '4\n-1 -2 -3 -4\n-5', output: '1 2', isHidden: true, points: 50 }
                ],
                difficulty: 'EASY',
                score: 200,
                timeLimit: 2,
                memoryLimit: 256,
                tags: ['array', 'hash-table'],
                order: 1
            },
            {
                contestId: CONTEST_ID,
                title: 'Fibonacci Number',
                description: 'The Fibonacci numbers form a sequence where each number is the sum of the two preceding ones, starting from 0 and 1.\n\nGiven n, calculate F(n) where F(0) = 0 and F(1) = 1.',
                inputFormat: 'A single integer n',
                outputFormat: 'The nth Fibonacci number',
                constraints: '0 <= n <= 30',
                examples: [
                    { input: '5', output: '5', explanation: 'F(5) = F(4) + F(3) = 3 + 2 = 5' },
                    { input: '10', output: '55', explanation: 'F(10) = 55' }
                ],
                testCases: [
                    { input: '0', output: '0', isHidden: false, points: 40 },
                    { input: '1', output: '1', isHidden: false, points: 40 },
                    { input: '5', output: '5', isHidden: false, points: 40 },
                    { input: '10', output: '55', isHidden: true, points: 40 },
                    { input: '20', output: '6765', isHidden: true, points: 40 }
                ],
                difficulty: 'EASY',
                score: 200,
                timeLimit: 1,
                memoryLimit: 256,
                tags: ['math', 'recursion', 'dynamic-programming'],
                order: 2
            }
        ];

        await CodingProblem.insertMany(codingProblems);
        console.log('✅ 2 Coding problems added successfully!');

        console.log('\n📋 Summary:');
        console.log('- 5 MCQs (20 marks each = 100 total)');
        console.log('- 2 Coding problems (200 points each = 400 total)');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addProblems();
