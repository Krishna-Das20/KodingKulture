import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MCQ from '../models/MCQ.js';
import User from '../models/User.js';

dotenv.config();

const questions = [
    {
        question: 'What is the output of this C code snippet? int arr[] = {10, 20, 30}; printf("%d", *(arr+1));',
        options: [
            { text: '10', isCorrect: false },
            { text: '20', isCorrect: true },
            { text: '30', isCorrect: false },
            { text: 'Compilation Error', isCorrect: false }
        ],
        correctAnswers: [1],
        explanation: '*(arr+1) is equivalent to arr[1], which is the second element of the array: 20.',
        difficulty: 'EASY',
        tags: ['c', 'pointers', 'arrays']
    },
    {
        question: 'What is the output of this C code snippet? char *str = "Hello"; printf("%c", *++str);',
        options: [
            { text: 'H', isCorrect: false },
            { text: 'e', isCorrect: true },
            { text: 'l', isCorrect: false },
            { text: 'Compilation Error', isCorrect: false }
        ],
        correctAnswers: [1],
        explanation: 'The pre-increment operator ++str increments the pointer to the next character (from H to e), and the dereference operator * gets that character.',
        difficulty: 'MEDIUM',
        tags: ['c', 'pointers', 'strings']
    },
    {
        question: 'What is the output of this C code snippet? int x = 0; if (x = 10) printf("A"); else printf("B");',
        options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
            { text: '0', isCorrect: false },
            { text: 'Compilation Error', isCorrect: false }
        ],
        correctAnswers: [0],
        explanation: 'The expression (x = 10) is an assignment, not a comparison. It assigns 10 to x and evaluates to 10 (which is truthy in C), so the if-block executes and prints A.',
        difficulty: 'EASY',
        tags: ['c', 'conditionals', 'operators']
    },
    {
        question: 'What is the output of this C expression? printf("%d", sizeof(char));',
        options: [
            { text: '2', isCorrect: false },
            { text: '4', isCorrect: false },
            { text: '8', isCorrect: false },
            { text: '1', isCorrect: true }
        ],
        correctAnswers: [3],
        explanation: 'In C, the size of a char is guaranteed to be exactly 1 byte by definition.',
        difficulty: 'EASY',
        tags: ['c', 'sizeof', 'datatypes']
    },
    {
        question: 'What is the exact output of this C code snippet? int i = 5; printf("%d", i++ * 2);',
        options: [
            { text: '12', isCorrect: false },
            { text: '10', isCorrect: true },
            { text: '11', isCorrect: false },
            { text: 'Compilation Error', isCorrect: false }
        ],
        correctAnswers: [1],
        explanation: 'The post-increment operator (i++) returns the original value of i (5) for the multiplication, resulting in 5 * 2 = 10. Only after the expression is evaluated does i become 6.',
        difficulty: 'MEDIUM',
        tags: ['c', 'operators']
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const admin = await User.findOne({ email: 'krishnadas2806@gmail.com' });
        if (!admin) {
            console.error('❌ Admin user not found');
            process.exit(1);
        }

        // Delete previous code snippet questions to clean up
        const delResult = await MCQ.deleteMany({ question: { $regex: 'code snippet', $options: 'i' } });
        console.log(`🗑️ Deleted ${delResult.deletedCount} old snippet MCQs.`);

        const existingCount = await MCQ.countDocuments({ category: 'TECHNICAL' });

        const mcqDocs = questions.map((q, i) => ({
            ...q,
            isLibrary: true,
            isPublic: true,
            category: 'TECHNICAL',
            marks: 4,
            negativeMarks: 0,
            createdBy: admin._id,
            order: existingCount + i + 1
        }));

        const result = await MCQ.insertMany(mcqDocs);
        console.log(`\n🎉 Successfully inserted ${result.length} C-only code snippet MCQs into production!`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seed();
