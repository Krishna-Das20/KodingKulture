import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixPalindromeTestcases() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get CodingProblem model
        const CodingProblem = mongoose.model('CodingProblem', new mongoose.Schema({}, { strict: false }));

        // Find Palindrome Check problem
        const problem = await CodingProblem.findOne({ title: 'Palindrome Check' });

        if (!problem) {
            console.log('Problem not found');
            process.exit(1);
        }

        console.log('Found Palindrome Check problem');
        console.log('Current testcases:', problem.testcases.length);

        // Fix the empty input testcase - replace empty string with a single space test
        const fixedTestcases = problem.testcases.map((tc, index) => {
            if (tc.input === '' || !tc.input) {
                console.log(`Fixing testcase ${index + 1} - was empty`);
                return {
                    ...tc.toObject ? tc.toObject() : tc,
                    input: ' ',  // Single space - should be palindrome
                    output: 'true'
                };
            }
            return tc;
        });

        // Update the problem
        await CodingProblem.updateOne(
            { _id: problem._id },
            { $set: { testcases: fixedTestcases } }
        );

        console.log('✅ Fixed testcases!');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixPalindromeTestcases();
