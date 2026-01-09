import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MCQ Schema
const mcqSchema = new mongoose.Schema({
    contestId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isLibrary: { type: Boolean, default: false },
    question: String,
    options: [{ text: String, isCorrect: Boolean }],
    correctAnswers: [Number],
    marks: { type: Number, default: 4 },
    negativeMarks: { type: Number, default: 1 },
    difficulty: { type: String, default: 'MEDIUM' },
    category: String,
    explanation: String,
    tags: [String],
    metrics: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        wrong: { type: Number, default: 0 }
    }
}, { timestamps: true });

const MCQ = mongoose.model('MCQ', mcqSchema);

// CodingProblem Schema
const codingProblemSchema = new mongoose.Schema({
    contestId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isLibrary: { type: Boolean, default: false },
    title: String,
    description: String,
    inputFormat: String,
    outputFormat: String,
    constraints: [String],
    examples: [{ input: String, output: String, explanation: String }],
    testcases: [{ input: String, output: String, hidden: Boolean, points: Number }],
    score: { type: Number, default: 100 },
    difficulty: String,
    category: String,
    timeLimit: { type: Number, default: 2 },
    memoryLimit: { type: Number, default: 256 },
    tags: [String],
    metrics: {
        attempted: { type: Number, default: 0 },
        accepted: { type: Number, default: 0 },
        wrongAnswer: { type: Number, default: 0 },
        tle: { type: Number, default: 0 },
        runtimeError: { type: Number, default: 0 }
    }
}, { timestamps: true });

const CodingProblem = mongoose.model('CodingProblem', codingProblemSchema);

// ========== CODING PROBLEMS ==========
const codingProblems = [
    {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
        inputFormat: 'First line: n (number of elements)\nSecond line: n space-separated integers\nThird line: target sum',
        outputFormat: 'Two space-separated indices (0-indexed)',
        constraints: ['2 <= n <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists'],
        difficulty: 'EASY',
        category: 'DSA',
        score: 100,
        tags: ['array', 'hash-table'],
        examples: [
            { input: '4\n2 7 11 15\n9', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
            { input: '3\n3 2 4\n6', output: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' }
        ],
        testcases: [
            { input: '4\n2 7 11 15\n9', output: '0 1', hidden: false, points: 10 },
            { input: '3\n3 2 4\n6', output: '1 2', hidden: false, points: 10 },
            { input: '5\n1 5 3 8 2\n10', output: '2 3', hidden: true, points: 10 },
            { input: '4\n-1 -2 -3 -4\n-5', output: '1 2', hidden: true, points: 10 },
            { input: '6\n1 2 3 4 5 6\n11', output: '4 5', hidden: true, points: 10 },
            { input: '3\n0 4 4\n8', output: '1 2', hidden: true, points: 10 },
            { input: '4\n-3 4 3 90\n0', output: '0 2', hidden: true, points: 10 },
            { input: '5\n5 75 25 48 52\n100', output: '3 4', hidden: true, points: 10 },
            { input: '2\n3 3\n6', output: '0 1', hidden: true, points: 10 },
            { input: '4\n1 1 1 4\n5', output: '2 3', hidden: true, points: 10 }
        ]
    },
    {
        title: 'Reverse String',
        description: 'Write a function that reverses a string. The input string is given as an array of characters.',
        inputFormat: 'A single line containing the string to reverse',
        outputFormat: 'The reversed string',
        constraints: ['1 <= s.length <= 10^5', 's contains printable ASCII characters'],
        difficulty: 'EASY',
        category: 'GENERAL',
        score: 100,
        tags: ['string', 'two-pointers'],
        examples: [
            { input: 'hello', output: 'olleh', explanation: 'Reverse each character' },
            { input: 'Hannah', output: 'hannaH', explanation: 'Case is preserved' }
        ],
        testcases: [
            { input: 'hello', output: 'olleh', hidden: false, points: 10 },
            { input: 'Hannah', output: 'hannaH', hidden: false, points: 10 },
            { input: 'a', output: 'a', hidden: true, points: 10 },
            { input: 'ab', output: 'ba', hidden: true, points: 10 },
            { input: 'racecar', output: 'racecar', hidden: true, points: 10 },
            { input: 'OpenAI', output: 'IAnepO', hidden: true, points: 10 },
            { input: '12345', output: '54321', hidden: true, points: 10 },
            { input: 'Hello World', output: 'dlroW olleH', hidden: true, points: 10 },
            { input: '!@#$%', output: '%$#@!', hidden: true, points: 10 },
            { input: 'AbCdEf', output: 'fEdCbA', hidden: true, points: 10 }
        ]
    },
    {
        title: 'Fibonacci Number',
        description: 'The Fibonacci numbers form a sequence where each number is the sum of the two preceding ones, starting from 0 and 1. Given n, calculate F(n).',
        inputFormat: 'A single integer n',
        outputFormat: 'The nth Fibonacci number',
        constraints: ['0 <= n <= 30'],
        difficulty: 'EASY',
        category: 'ALGORITHMS',
        score: 100,
        tags: ['math', 'recursion', 'dynamic-programming'],
        examples: [
            { input: '5', output: '5', explanation: 'F(5) = F(4) + F(3) = 3 + 2 = 5' },
            { input: '10', output: '55', explanation: '0,1,1,2,3,5,8,13,21,34,55' }
        ],
        testcases: [
            { input: '0', output: '0', hidden: false, points: 10 },
            { input: '1', output: '1', hidden: false, points: 10 },
            { input: '5', output: '5', hidden: true, points: 10 },
            { input: '10', output: '55', hidden: true, points: 10 },
            { input: '15', output: '610', hidden: true, points: 10 },
            { input: '20', output: '6765', hidden: true, points: 10 },
            { input: '25', output: '75025', hidden: true, points: 10 },
            { input: '30', output: '832040', hidden: true, points: 10 },
            { input: '2', output: '1', hidden: true, points: 10 },
            { input: '7', output: '13', hidden: true, points: 10 }
        ]
    },
    {
        title: 'Palindrome Check',
        description: 'Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
        inputFormat: 'A single line containing the string',
        outputFormat: 'true if palindrome, false otherwise',
        constraints: ['1 <= s.length <= 2 * 10^5', 's consists only of printable ASCII characters'],
        difficulty: 'EASY',
        category: 'GENERAL',
        score: 100,
        tags: ['string', 'two-pointers'],
        examples: [
            { input: 'A man a plan a canal Panama', output: 'true', explanation: 'Removing spaces and case: amanaplanacanalpanama is a palindrome' },
            { input: 'race a car', output: 'false', explanation: 'raceacar is not a palindrome' }
        ],
        testcases: [
            { input: 'A man a plan a canal Panama', output: 'true', hidden: false, points: 10 },
            { input: 'race a car', output: 'false', hidden: false, points: 10 },
            { input: 'a', output: 'true', hidden: true, points: 10 },
            { input: '', output: 'true', hidden: true, points: 10 },
            { input: 'Was it a car or a cat I saw', output: 'true', hidden: true, points: 10 },
            { input: 'No lemon no melon', output: 'true', hidden: true, points: 10 },
            { input: 'hello', output: 'false', hidden: true, points: 10 },
            { input: '12321', output: 'true', hidden: true, points: 10 },
            { input: '12345', output: 'false', hidden: true, points: 10 },
            { input: 'Madam', output: 'true', hidden: true, points: 10 }
        ]
    },
    {
        title: 'Maximum Subarray',
        description: 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.',
        inputFormat: 'First line: n (size of array)\nSecond line: n space-separated integers',
        outputFormat: 'Maximum subarray sum',
        constraints: ['1 <= n <= 10^5', '-10^4 <= nums[i] <= 10^4'],
        difficulty: 'MEDIUM',
        category: 'DSA',
        score: 150,
        tags: ['array', 'dynamic-programming', 'divide-and-conquer'],
        examples: [
            { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: '[4,-1,2,1] has the largest sum = 6' },
            { input: '1\n1', output: '1', explanation: 'Single element' }
        ],
        testcases: [
            { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', hidden: false, points: 15 },
            { input: '1\n1', output: '1', hidden: false, points: 15 },
            { input: '5\n5 4 -1 7 8', output: '23', hidden: true, points: 10 },
            { input: '3\n-1 -2 -3', output: '-1', hidden: true, points: 10 },
            { input: '4\n1 2 3 4', output: '10', hidden: true, points: 10 },
            { input: '6\n-2 -1 -3 -4 -1 -2', output: '-1', hidden: true, points: 10 },
            { input: '5\n2 -1 2 3 4', output: '10', hidden: true, points: 10 },
            { input: '7\n-1 2 3 -4 5 6 -7', output: '12', hidden: true, points: 10 },
            { input: '4\n-100 50 50 -100', output: '100', hidden: true, points: 10 },
            { input: '3\n0 0 0', output: '0', hidden: true, points: 10 }
        ]
    },
    {
        title: 'Binary Search',
        description: 'Given a sorted array of integers and a target value, return the index if the target is found. If not, return -1.',
        inputFormat: 'First line: n (size of array)\nSecond line: n sorted space-separated integers\nThird line: target value',
        outputFormat: 'Index of target or -1',
        constraints: ['1 <= n <= 10^4', '-10^4 <= nums[i] <= 10^4', 'nums is sorted in ascending order'],
        difficulty: 'EASY',
        category: 'ALGORITHMS',
        score: 100,
        tags: ['array', 'binary-search'],
        examples: [
            { input: '6\n-1 0 3 5 9 12\n9', output: '4', explanation: '9 exists at index 4' },
            { input: '6\n-1 0 3 5 9 12\n2', output: '-1', explanation: '2 does not exist' }
        ],
        testcases: [
            { input: '6\n-1 0 3 5 9 12\n9', output: '4', hidden: false, points: 10 },
            { input: '6\n-1 0 3 5 9 12\n2', output: '-1', hidden: false, points: 10 },
            { input: '1\n5\n5', output: '0', hidden: true, points: 10 },
            { input: '5\n1 2 3 4 5\n1', output: '0', hidden: true, points: 10 },
            { input: '5\n1 2 3 4 5\n5', output: '4', hidden: true, points: 10 },
            { input: '5\n1 2 3 4 5\n3', output: '2', hidden: true, points: 10 },
            { input: '3\n10 20 30\n15', output: '-1', hidden: true, points: 10 },
            { input: '4\n-10 -5 0 5\n-5', output: '1', hidden: true, points: 10 },
            { input: '7\n1 3 5 7 9 11 13\n7', output: '3', hidden: true, points: 10 },
            { input: '2\n1 2\n3', output: '-1', hidden: true, points: 10 }
        ]
    },
    {
        title: 'Merge Two Sorted Arrays',
        description: 'Given two sorted arrays nums1 and nums2, merge them into a single sorted array.',
        inputFormat: 'First line: n (size of first array)\nSecond line: n space-separated integers\nThird line: m (size of second array)\nFourth line: m space-separated integers',
        outputFormat: 'Space-separated merged sorted array',
        constraints: ['0 <= n, m <= 200', '-10^9 <= nums[i] <= 10^9'],
        difficulty: 'EASY',
        category: 'DSA',
        score: 100,
        tags: ['array', 'two-pointers', 'sorting'],
        examples: [
            { input: '3\n1 2 4\n3\n1 3 4', output: '1 1 2 3 4 4', explanation: 'Merge and sort' },
            { input: '1\n1\n0', output: '1', explanation: 'Empty second array' }
        ],
        testcases: [
            { input: '3\n1 2 4\n3\n1 3 4', output: '1 1 2 3 4 4', hidden: false, points: 10 },
            { input: '1\n1\n0', output: '1', hidden: false, points: 10 },
            { input: '0\n\n1\n1', output: '1', hidden: true, points: 10 },
            { input: '2\n1 3\n2\n2 4', output: '1 2 3 4', hidden: true, points: 10 },
            { input: '3\n-3 -1 0\n3\n1 2 3', output: '-3 -1 0 1 2 3', hidden: true, points: 10 },
            { input: '4\n1 1 1 1\n4\n2 2 2 2', output: '1 1 1 1 2 2 2 2', hidden: true, points: 10 },
            { input: '2\n5 10\n2\n3 7', output: '3 5 7 10', hidden: true, points: 10 },
            { input: '5\n1 2 3 4 5\n5\n6 7 8 9 10', output: '1 2 3 4 5 6 7 8 9 10', hidden: true, points: 10 },
            { input: '3\n100 200 300\n3\n150 250 350', output: '100 150 200 250 300 350', hidden: true, points: 10 },
            { input: '1\n0\n1\n0', output: '0 0', hidden: true, points: 10 }
        ]
    },
    {
        title: 'Valid Parentheses',
        description: 'Given a string containing just the characters (, ), {, }, [ and ], determine if the input string is valid. An input string is valid if brackets are closed in the correct order.',
        inputFormat: 'A single line containing the string of brackets',
        outputFormat: 'true if valid, false otherwise',
        constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only'],
        difficulty: 'EASY',
        category: 'DSA',
        score: 100,
        tags: ['string', 'stack'],
        examples: [
            { input: '()', output: 'true', explanation: 'Simple valid pair' },
            { input: '([)]', output: 'false', explanation: 'Wrong order' }
        ],
        testcases: [
            { input: '()', output: 'true', hidden: false, points: 10 },
            { input: '([)]', output: 'false', hidden: false, points: 10 },
            { input: '()[]{}', output: 'true', hidden: true, points: 10 },
            { input: '{[]}', output: 'true', hidden: true, points: 10 },
            { input: '(', output: 'false', hidden: true, points: 10 },
            { input: '((()))', output: 'true', hidden: true, points: 10 },
            { input: '{{{{', output: 'false', hidden: true, points: 10 },
            { input: '[{()}]', output: 'true', hidden: true, points: 10 },
            { input: '](', output: 'false', hidden: true, points: 10 },
            { input: '', output: 'true', hidden: true, points: 10 }
        ]
    },
    {
        title: 'Count Vowels',
        description: 'Given a string, count the number of vowels (a, e, i, o, u) in it. Consider both uppercase and lowercase.',
        inputFormat: 'A single line containing the string',
        outputFormat: 'Number of vowels',
        constraints: ['1 <= s.length <= 10^5', 's contains ASCII characters'],
        difficulty: 'EASY',
        category: 'GENERAL',
        score: 80,
        tags: ['string', 'counting'],
        examples: [
            { input: 'Hello World', output: '3', explanation: 'e, o, o are vowels' },
            { input: 'AEIOU', output: '5', explanation: 'All 5 characters are vowels' }
        ],
        testcases: [
            { input: 'Hello World', output: '3', hidden: false, points: 10 },
            { input: 'AEIOU', output: '5', hidden: false, points: 10 },
            { input: 'xyz', output: '0', hidden: true, points: 10 },
            { input: 'Programming', output: '3', hidden: true, points: 10 },
            { input: 'aEiOu', output: '5', hidden: true, points: 10 },
            { input: 'bcdfghjklmnpqrstvwxyz', output: '0', hidden: true, points: 10 },
            { input: 'The quick brown fox', output: '5', hidden: true, points: 10 },
            { input: 'A', output: '1', hidden: true, points: 10 },
            { input: '12345', output: '0', hidden: true, points: 10 },
            { input: 'Education', output: '5', hidden: true, points: 10 }
        ]
    },
    {
        title: 'FizzBuzz',
        description: 'Given an integer n, return a list of strings from 1 to n. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for multiples of both print "FizzBuzz", otherwise print the number.',
        inputFormat: 'A single integer n',
        outputFormat: 'n lines of output',
        constraints: ['1 <= n <= 10^4'],
        difficulty: 'EASY',
        category: 'GENERAL',
        score: 80,
        tags: ['math', 'string', 'simulation'],
        examples: [
            { input: '5', output: '1\n2\nFizz\n4\nBuzz', explanation: '3 is Fizz, 5 is Buzz' },
            { input: '15', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', explanation: '15 is FizzBuzz' }
        ],
        testcases: [
            { input: '5', output: '1\n2\nFizz\n4\nBuzz', hidden: false, points: 10 },
            { input: '15', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', hidden: false, points: 10 },
            { input: '1', output: '1', hidden: true, points: 10 },
            { input: '3', output: '1\n2\nFizz', hidden: true, points: 10 },
            { input: '10', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz', hidden: true, points: 10 },
            { input: '30', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz', hidden: true, points: 10 },
            { input: '2', output: '1\n2', hidden: true, points: 10 },
            { input: '6', output: '1\n2\nFizz\n4\nBuzz\nFizz', hidden: true, points: 10 },
            { input: '9', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz', hidden: true, points: 10 },
            { input: '20', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz', hidden: true, points: 10 }
        ]
    }
];

// ========== MCQ QUESTIONS ==========

// TECHNICAL MCQs
const technicalMCQs = [
    {
        question: 'What is the time complexity of binary search?',
        options: [{ text: 'O(n)', isCorrect: false }, { text: 'O(log n)', isCorrect: true }, { text: 'O(n²)', isCorrect: false }, { text: 'O(1)', isCorrect: false }],
        explanation: 'Binary search divides the search space in half each time.',
        category: 'TECHNICAL', difficulty: 'EASY', marks: 4, tags: ['algorithms', 'complexity']
    },
    {
        question: 'Which data structure uses LIFO (Last In First Out) principle?',
        options: [{ text: 'Queue', isCorrect: false }, { text: 'Stack', isCorrect: true }, { text: 'Array', isCorrect: false }, { text: 'Linked List', isCorrect: false }],
        explanation: 'Stack follows LIFO - the last element pushed is the first one to be popped.',
        category: 'TECHNICAL', difficulty: 'EASY', marks: 4, tags: ['data-structures']
    },
    {
        question: 'What does SQL stand for?',
        options: [{ text: 'Structured Query Language', isCorrect: true }, { text: 'Simple Question Language', isCorrect: false }, { text: 'Standard Query Logic', isCorrect: false }, { text: 'System Query Language', isCorrect: false }],
        explanation: 'SQL stands for Structured Query Language.',
        category: 'TECHNICAL', difficulty: 'EASY', marks: 4, tags: ['database', 'sql']
    },
    {
        question: 'Which of the following is NOT a JavaScript framework?',
        options: [{ text: 'React', isCorrect: false }, { text: 'Angular', isCorrect: false }, { text: 'Django', isCorrect: true }, { text: 'Vue', isCorrect: false }],
        explanation: 'Django is a Python web framework.',
        category: 'TECHNICAL', difficulty: 'MEDIUM', marks: 4, tags: ['frameworks', 'javascript']
    },
    {
        question: 'What is the output of: console.log(typeof null)?',
        options: [{ text: '"null"', isCorrect: false }, { text: '"undefined"', isCorrect: false }, { text: '"object"', isCorrect: true }, { text: '"boolean"', isCorrect: false }],
        explanation: 'typeof null returns "object" due to a legacy JavaScript bug.',
        category: 'TECHNICAL', difficulty: 'MEDIUM', marks: 4, tags: ['javascript', 'quirks']
    },
    {
        question: 'Which HTTP method is idempotent?',
        options: [{ text: 'POST', isCorrect: false }, { text: 'GET', isCorrect: true }, { text: 'PATCH', isCorrect: false }, { text: 'None of the above', isCorrect: false }],
        explanation: 'GET is idempotent - multiple identical requests have the same effect as a single request.',
        category: 'TECHNICAL', difficulty: 'MEDIUM', marks: 4, tags: ['http', 'web']
    },
    {
        question: 'What is the default port for HTTPS?',
        options: [{ text: '80', isCorrect: false }, { text: '443', isCorrect: true }, { text: '8080', isCorrect: false }, { text: '3000', isCorrect: false }],
        explanation: 'HTTPS uses port 443 by default, while HTTP uses port 80.',
        category: 'TECHNICAL', difficulty: 'EASY', marks: 4, tags: ['networking', 'web']
    },
    {
        question: 'Which sorting algorithm has the best average time complexity?',
        options: [{ text: 'Bubble Sort - O(n²)', isCorrect: false }, { text: 'Quick Sort - O(n log n)', isCorrect: true }, { text: 'Selection Sort - O(n²)', isCorrect: false }, { text: 'Insertion Sort - O(n²)', isCorrect: false }],
        explanation: 'Quick Sort has O(n log n) average time complexity.',
        category: 'TECHNICAL', difficulty: 'MEDIUM', marks: 4, tags: ['algorithms', 'sorting']
    },
    {
        question: 'What is a foreign key in a database?',
        options: [{ text: 'A key that uniquely identifies a row', isCorrect: false }, { text: 'A key that references a primary key in another table', isCorrect: true }, { text: 'A encrypted key', isCorrect: false }, { text: 'A composite key', isCorrect: false }],
        explanation: 'A foreign key creates a link between two tables.',
        category: 'TECHNICAL', difficulty: 'EASY', marks: 4, tags: ['database', 'sql']
    },
    {
        question: 'What does API stand for?',
        options: [{ text: 'Application Programming Interface', isCorrect: true }, { text: 'Advanced Program Integration', isCorrect: false }, { text: 'Automated Process Interface', isCorrect: false }, { text: 'Application Process Integration', isCorrect: false }],
        explanation: 'API stands for Application Programming Interface.',
        category: 'TECHNICAL', difficulty: 'EASY', marks: 4, tags: ['web', 'programming']
    }
];

// APTITUDE MCQs
const aptitudeMCQs = [
    {
        question: 'If a train travels at 60 km/h, how long will it take to cover 180 km?',
        options: [{ text: '2 hours', isCorrect: false }, { text: '3 hours', isCorrect: true }, { text: '4 hours', isCorrect: false }, { text: '2.5 hours', isCorrect: false }],
        explanation: 'Time = Distance/Speed = 180/60 = 3 hours',
        category: 'APTITUDE', difficulty: 'EASY', marks: 4, tags: ['speed', 'time', 'distance']
    },
    {
        question: 'What is 25% of 400?',
        options: [{ text: '80', isCorrect: false }, { text: '100', isCorrect: true }, { text: '120', isCorrect: false }, { text: '75', isCorrect: false }],
        explanation: '25% of 400 = (25/100) × 400 = 100',
        category: 'APTITUDE', difficulty: 'EASY', marks: 4, tags: ['percentage']
    },
    {
        question: 'If the cost price is ₹500 and selling price is ₹600, what is the profit percentage?',
        options: [{ text: '10%', isCorrect: false }, { text: '15%', isCorrect: false }, { text: '20%', isCorrect: true }, { text: '25%', isCorrect: false }],
        explanation: 'Profit = 100, Profit% = (100/500) × 100 = 20%',
        category: 'APTITUDE', difficulty: 'EASY', marks: 4, tags: ['profit-loss']
    },
    {
        question: 'A man can do a work in 10 days. In how many days can 5 men do the same work?',
        options: [{ text: '1 day', isCorrect: false }, { text: '2 days', isCorrect: true }, { text: '5 days', isCorrect: false }, { text: '50 days', isCorrect: false }],
        explanation: 'Work done by 5 men = 5 times faster, so 10/5 = 2 days',
        category: 'APTITUDE', difficulty: 'EASY', marks: 4, tags: ['work-time']
    },
    {
        question: 'What is the simple interest on ₹1000 at 10% per annum for 2 years?',
        options: [{ text: '₹100', isCorrect: false }, { text: '₹200', isCorrect: true }, { text: '₹210', isCorrect: false }, { text: '₹150', isCorrect: false }],
        explanation: 'SI = (P × R × T)/100 = (1000 × 10 × 2)/100 = ₹200',
        category: 'APTITUDE', difficulty: 'EASY', marks: 4, tags: ['interest']
    },
    {
        question: 'The ratio of boys to girls is 3:2. If there are 30 boys, how many girls are there?',
        options: [{ text: '15', isCorrect: false }, { text: '20', isCorrect: true }, { text: '25', isCorrect: false }, { text: '18', isCorrect: false }],
        explanation: '3 parts = 30, so 1 part = 10. Girls = 2 parts = 20',
        category: 'APTITUDE', difficulty: 'EASY', marks: 4, tags: ['ratio']
    },
    {
        question: 'What is the average of 10, 20, 30, 40, 50?',
        options: [{ text: '25', isCorrect: false }, { text: '30', isCorrect: true }, { text: '35', isCorrect: false }, { text: '40', isCorrect: false }],
        explanation: 'Sum = 150, Average = 150/5 = 30',
        category: 'APTITUDE', difficulty: 'EASY', marks: 4, tags: ['average']
    },
    {
        question: 'A shopkeeper gives 20% discount. What is the selling price of an item marked at ₹500?',
        options: [{ text: '₹400', isCorrect: true }, { text: '₹450', isCorrect: false }, { text: '₹480', isCorrect: false }, { text: '₹420', isCorrect: false }],
        explanation: 'Discount = 20% of 500 = ₹100. SP = 500 - 100 = ₹400',
        category: 'APTITUDE', difficulty: 'EASY', marks: 4, tags: ['discount']
    },
    {
        question: 'Two pipes can fill a tank in 4 and 6 hours respectively. How long to fill together?',
        options: [{ text: '2 hours', isCorrect: false }, { text: '2.4 hours', isCorrect: true }, { text: '5 hours', isCorrect: false }, { text: '3 hours', isCorrect: false }],
        explanation: 'Combined rate = 1/4 + 1/6 = 5/12. Time = 12/5 = 2.4 hours',
        category: 'APTITUDE', difficulty: 'MEDIUM', marks: 4, tags: ['pipes-cisterns']
    },
    {
        question: 'If the perimeter of a square is 40 cm, what is its area?',
        options: [{ text: '64 cm²', isCorrect: false }, { text: '100 cm²', isCorrect: true }, { text: '80 cm²', isCorrect: false }, { text: '160 cm²', isCorrect: false }],
        explanation: 'Side = 40/4 = 10 cm. Area = 10² = 100 cm²',
        category: 'APTITUDE', difficulty: 'EASY', marks: 4, tags: ['geometry']
    }
];

// REASONING MCQs
const reasoningMCQs = [
    {
        question: 'Find the next number: 2, 4, 8, 16, ?',
        options: [{ text: '24', isCorrect: false }, { text: '32', isCorrect: true }, { text: '20', isCorrect: false }, { text: '28', isCorrect: false }],
        explanation: 'Each number is multiplied by 2. 16 × 2 = 32',
        category: 'REASONING', difficulty: 'EASY', marks: 4, tags: ['series', 'pattern']
    },
    {
        question: 'If APPLE is coded as ELPPA, how is MANGO coded?',
        options: [{ text: 'OGNAM', isCorrect: true }, { text: 'NGAMO', isCorrect: false }, { text: 'MANOG', isCorrect: false }, { text: 'NAMOG', isCorrect: false }],
        explanation: 'The word is reversed. MANGO → OGNAM',
        category: 'REASONING', difficulty: 'EASY', marks: 4, tags: ['coding', 'pattern']
    },
    {
        question: 'Complete the analogy: Doctor : Hospital :: Teacher : ?',
        options: [{ text: 'Court', isCorrect: false }, { text: 'Factory', isCorrect: false }, { text: 'School', isCorrect: true }, { text: 'Office', isCorrect: false }],
        explanation: 'A doctor works at a hospital, a teacher works at a school.',
        category: 'REASONING', difficulty: 'EASY', marks: 4, tags: ['analogy']
    },
    {
        question: 'Find the odd one out: Apple, Mango, Carrot, Orange',
        options: [{ text: 'Apple', isCorrect: false }, { text: 'Mango', isCorrect: false }, { text: 'Carrot', isCorrect: true }, { text: 'Orange', isCorrect: false }],
        explanation: 'Carrot is a vegetable, others are fruits.',
        category: 'REASONING', difficulty: 'EASY', marks: 4, tags: ['odd-one-out']
    },
    {
        question: 'If A=1, B=2, C=3... what is the value of CAT?',
        options: [{ text: '24', isCorrect: true }, { text: '22', isCorrect: false }, { text: '26', isCorrect: false }, { text: '20', isCorrect: false }],
        explanation: 'C=3, A=1, T=20. Sum = 3+1+20 = 24',
        category: 'REASONING', difficulty: 'EASY', marks: 4, tags: ['coding', 'letter-value']
    },
    {
        question: 'Find the next: A, C, E, G, ?',
        options: [{ text: 'H', isCorrect: false }, { text: 'I', isCorrect: true }, { text: 'J', isCorrect: false }, { text: 'K', isCorrect: false }],
        explanation: 'Alternate letters of the alphabet. After G comes I.',
        category: 'REASONING', difficulty: 'EASY', marks: 4, tags: ['series', 'alphabet']
    },
    {
        question: 'If South-East becomes North, then North-East becomes?',
        options: [{ text: 'South', isCorrect: false }, { text: 'West', isCorrect: true }, { text: 'East', isCorrect: false }, { text: 'South-West', isCorrect: false }],
        explanation: '135° rotation clockwise. North-East → West',
        category: 'REASONING', difficulty: 'MEDIUM', marks: 4, tags: ['direction']
    },
    {
        question: 'Pointing to a man, a woman says "His mother is the only daughter of my mother." How is the man related to her?',
        options: [{ text: 'Brother', isCorrect: false }, { text: 'Son', isCorrect: true }, { text: 'Nephew', isCorrect: false }, { text: 'Uncle', isCorrect: false }],
        explanation: 'Only daughter of my mother = herself. So the man is her son.',
        category: 'REASONING', difficulty: 'MEDIUM', marks: 4, tags: ['blood-relation']
    },
    {
        question: 'How many triangles are in a star shape (5-pointed star)?',
        options: [{ text: '5', isCorrect: false }, { text: '10', isCorrect: true }, { text: '15', isCorrect: false }, { text: '8', isCorrect: false }],
        explanation: 'A 5-pointed star contains 10 triangles: 5 small at tips + 1 central pentagon forming 5 more.',
        category: 'REASONING', difficulty: 'MEDIUM', marks: 4, tags: ['counting', 'figures']
    },
    {
        question: 'Find the missing number: 3, 9, 27, 81, ?',
        options: [{ text: '162', isCorrect: false }, { text: '243', isCorrect: true }, { text: '189', isCorrect: false }, { text: '270', isCorrect: false }],
        explanation: 'Each number is multiplied by 3. 81 × 3 = 243',
        category: 'REASONING', difficulty: 'EASY', marks: 4, tags: ['series', 'pattern']
    }
];

// ENTREPRENEURSHIP MCQs
const entrepreneurshipMCQs = [
    {
        question: 'What is the primary purpose of a business plan?',
        options: [{ text: 'To impress investors only', isCorrect: false }, { text: 'To provide a roadmap for the business', isCorrect: true }, { text: 'To fulfill legal requirements', isCorrect: false }, { text: 'To calculate taxes', isCorrect: false }],
        explanation: 'A business plan serves as a roadmap outlining goals, strategies, and financial projections.',
        category: 'ENTREPRENEURSHIP', difficulty: 'EASY', marks: 4, tags: ['business-planning']
    },
    {
        question: 'What does MVP stand for in startups?',
        options: [{ text: 'Most Valuable Player', isCorrect: false }, { text: 'Minimum Viable Product', isCorrect: true }, { text: 'Maximum Value Proposition', isCorrect: false }, { text: 'Market Value Price', isCorrect: false }],
        explanation: 'MVP (Minimum Viable Product) is the simplest version of a product to test market response.',
        category: 'ENTREPRENEURSHIP', difficulty: 'EASY', marks: 4, tags: ['startup', 'product']
    },
    {
        question: 'Which of the following is a source of seed funding?',
        options: [{ text: 'Angel Investors', isCorrect: true }, { text: 'IPO', isCorrect: false }, { text: 'Bank Loans', isCorrect: false }, { text: 'Stock Market', isCorrect: false }],
        explanation: 'Angel investors provide early-stage seed funding to startups.',
        category: 'ENTREPRENEURSHIP', difficulty: 'EASY', marks: 4, tags: ['funding', 'investment']
    },
    {
        question: 'What is a pivot in startup terminology?',
        options: [{ text: 'A type of investment', isCorrect: false }, { text: 'A fundamental change in business strategy', isCorrect: true }, { text: 'A marketing technique', isCorrect: false }, { text: 'A legal document', isCorrect: false }],
        explanation: 'A pivot is a strategic shift in business model or product direction.',
        category: 'ENTREPRENEURSHIP', difficulty: 'MEDIUM', marks: 4, tags: ['strategy', 'startup']
    },
    {
        question: 'What does ROI stand for?',
        options: [{ text: 'Rate of Interest', isCorrect: false }, { text: 'Return on Investment', isCorrect: true }, { text: 'Risk of Investment', isCorrect: false }, { text: 'Revenue on Income', isCorrect: false }],
        explanation: 'ROI measures the profitability of an investment relative to its cost.',
        category: 'ENTREPRENEURSHIP', difficulty: 'EASY', marks: 4, tags: ['finance', 'metrics']
    },
    {
        question: 'What is a unicorn in startup terms?',
        options: [{ text: 'A startup valued at over $1 billion', isCorrect: true }, { text: 'A rare business model', isCorrect: false }, { text: 'A type of investor', isCorrect: false }, { text: 'A failed startup', isCorrect: false }],
        explanation: 'A unicorn is a privately held startup company valued at over $1 billion.',
        category: 'ENTREPRENEURSHIP', difficulty: 'EASY', marks: 4, tags: ['startup', 'valuation']
    },
    {
        question: 'What is bootstrapping in entrepreneurship?',
        options: [{ text: 'Raising venture capital', isCorrect: false }, { text: 'Self-funding the business', isCorrect: true }, { text: 'Going public', isCorrect: false }, { text: 'Filing for bankruptcy', isCorrect: false }],
        explanation: 'Bootstrapping means building a company using personal finances or operating revenues.',
        category: 'ENTREPRENEURSHIP', difficulty: 'EASY', marks: 4, tags: ['funding', 'self-funding']
    },
    {
        question: 'What is the purpose of a pitch deck?',
        options: [{ text: 'To train employees', isCorrect: false }, { text: 'To present business idea to investors', isCorrect: true }, { text: 'To create financial reports', isCorrect: false }, { text: 'To manage inventory', isCorrect: false }],
        explanation: 'A pitch deck is a presentation used to provide a brief overview of the business plan to potential investors.',
        category: 'ENTREPRENEURSHIP', difficulty: 'EASY', marks: 4, tags: ['pitch', 'investors']
    },
    {
        question: 'What is break-even point?',
        options: [{ text: 'When losses exceed profits', isCorrect: false }, { text: 'When total revenue equals total costs', isCorrect: true }, { text: 'When company goes bankrupt', isCorrect: false }, { text: 'When startup gets funding', isCorrect: false }],
        explanation: 'Break-even point is when total revenue equals total costs, resulting in neither profit nor loss.',
        category: 'ENTREPRENEURSHIP', difficulty: 'MEDIUM', marks: 4, tags: ['finance', 'accounting']
    },
    {
        question: 'What does B2B mean?',
        options: [{ text: 'Business to Business', isCorrect: true }, { text: 'Back to Basics', isCorrect: false }, { text: 'Build to Buy', isCorrect: false }, { text: 'Buyer to Broker', isCorrect: false }],
        explanation: 'B2B refers to commerce between two businesses, as opposed to B2C (Business to Consumer).',
        category: 'ENTREPRENEURSHIP', difficulty: 'EASY', marks: 4, tags: ['business-model', 'commerce']
    }
];

async function populateLibrary() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Add coding problems
        console.log('\n📝 Adding Coding Problems to Library...');
        for (const problem of codingProblems) {
            await CodingProblem.create({
                ...problem,
                isLibrary: true,
                contestId: null
            });
            console.log(`  ✅ ${problem.title}`);
        }
        console.log(`Added ${codingProblems.length} coding problems`);

        // Add MCQs
        console.log('\n📝 Adding MCQs to Library...');

        const allMCQs = [
            ...technicalMCQs,
            ...aptitudeMCQs,
            ...reasoningMCQs,
            ...entrepreneurshipMCQs
        ];

        for (const mcq of allMCQs) {
            const correctAnswers = mcq.options
                .map((opt, idx) => opt.isCorrect ? idx : -1)
                .filter(idx => idx !== -1);

            await MCQ.create({
                ...mcq,
                correctAnswers,
                isLibrary: true,
                contestId: null,
                negativeMarks: 1
            });
        }

        console.log(`  ✅ ${technicalMCQs.length} Technical MCQs`);
        console.log(`  ✅ ${aptitudeMCQs.length} Aptitude MCQs`);
        console.log(`  ✅ ${reasoningMCQs.length} Reasoning MCQs`);
        console.log(`  ✅ ${entrepreneurshipMCQs.length} Entrepreneurship MCQs`);
        console.log(`Total: ${allMCQs.length} MCQs added`);

        console.log('\n🎉 Library populated successfully!');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

populateLibrary();
