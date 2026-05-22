import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MCQ from '../models/MCQ.js';
import User from '../models/User.js';

dotenv.config();

const questions = [
    {
        question: 'What is the output of the following JavaScript code snippet?\n\n```javascript\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 1);\n}\n```',
        options: [
            { text: '0 1 2', isCorrect: false },
            { text: '3 3 3', isCorrect: true },
            { text: 'undefined undefined undefined', isCorrect: false },
            { text: 'SyntaxError', isCorrect: false }
        ],
        correctAnswers: [1],
        explanation: 'Because `var` is function-scoped (or globally scoped here) rather than block-scoped, the `setTimeout` callbacks all refer to the same `i` variable. By the time the timeout resolves, the loop has finished and `i` is 3.',
        difficulty: 'MEDIUM',
        tags: ['javascript', 'closures', 'hoisting']
    },
    {
        question: 'What is the output of the following Python code snippet?\n\n```python\ndef append_to(num, target=[]):\n    target.append(num)\n    return target\n\nprint(append_to(1))\nprint(append_to(2))\n```',
        options: [
            { text: '[1]\\n[2]', isCorrect: false },
            { text: '[1, 2]\\n[1, 2]', isCorrect: false },
            { text: '[1]\\n[1, 2]', isCorrect: true },
            { text: 'IndexError', isCorrect: false }
        ],
        correctAnswers: [2],
        explanation: 'In Python, default arguments are evaluated only once when the function is defined. Therefore, both calls to `append_to` use the exact same list object.',
        difficulty: 'MEDIUM',
        tags: ['python', 'functions', 'mutability']
    },
    {
        question: 'What is the output of the following C++ code snippet?\n\n```cpp\nint a = 10;\nint *p = &a;\nint **q = &p;\ncout << **q;\n```',
        options: [
            { text: 'The memory address of a', isCorrect: false },
            { text: 'The memory address of p', isCorrect: false },
            { text: '10', isCorrect: true },
            { text: 'Compilation Error', isCorrect: false }
        ],
        correctAnswers: [2],
        explanation: '`q` holds the address of the pointer `p` (a pointer to a pointer). Dereferencing `q` twice (`**q`) traverses from `q` to `p`, and then from `p` to `a`, outputting the value of `a` which is 10.',
        difficulty: 'EASY',
        tags: ['cpp', 'pointers', 'memory']
    },
    {
        question: 'What is the output of the following Java code snippet?\n\n```java\nString s1 = "hello";\nString s2 = new String("hello");\nSystem.out.print(s1 == s2);\n```',
        options: [
            { text: 'true', isCorrect: false },
            { text: 'false', isCorrect: true },
            { text: 'Compilation Error', isCorrect: false },
            { text: 'Runtime Exception', isCorrect: false }
        ],
        correctAnswers: [1],
        explanation: 'In Java, the `==` operator compares object references, not content. `s1` refers to a literal in the String pool, while `s2` points to a newly allocated String object on the heap. Thus, their references are different.',
        difficulty: 'EASY',
        tags: ['java', 'strings', 'memory']
    },
    {
        question: 'What is the output of the following JavaScript code snippet?\n\n```javascript\nconsole.log(typeof null);\n```',
        options: [
            { text: '"null"', isCorrect: false },
            { text: '"undefined"', isCorrect: false },
            { text: '"object"', isCorrect: true },
            { text: '"number"', isCorrect: false }
        ],
        correctAnswers: [2],
        explanation: 'This is a well-known historical bug in JavaScript. `null` is a primitive value, but `typeof null` incorrectly returns `"object"`.',
        difficulty: 'EASY',
        tags: ['javascript', 'types']
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const admin = await User.findOne({ email: 'krishnadas2806@gmail.com' });
        if (!admin) {
            console.error('❌ Admin user krishnadas2806@gmail.com not found in the database.');
            process.exit(1);
        }
        console.log(`📌 Using admin: ${admin.name} (${admin.email})`);

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
        console.log(`\n🎉 Successfully inserted ${result.length} code snippet MCQs into production!`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seed();
