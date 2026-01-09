import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const codingProblemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'EASY' },
    category: { type: String, default: 'DSA' },
    tags: [String],
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
    testcases: [{
        input: { type: String, required: true },
        output: { type: String, required: true },
        isHidden: { type: Boolean, default: false }
    }],
    constraints: String,
    codeTemplates: [{
        languageId: Number,
        language: String,
        template: String
    }],
    score: { type: Number, default: 100 },
    timeLimit: { type: Number, default: 2000 },
    memoryLimit: { type: Number, default: 256 },
    isLibrary: { type: Boolean, default: false },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', default: null }
}, { timestamps: true });

const CodingProblem = mongoose.model('CodingProblem', codingProblemSchema);

const twoSumProblem = {
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'EASY',
    category: 'DSA',
    tags: ['Array', 'Hash Table'],
    examples: [
        {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        },
        {
            input: 'nums = [3,2,4], target = 6',
            output: '[1,2]',
            explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
        }
    ],
    testcases: [
        { input: '4\n2 7 11 15\n9', output: '0 1', isHidden: false },
        { input: '3\n3 2 4\n6', output: '1 2', isHidden: false },
        { input: '2\n3 3\n6', output: '0 1', isHidden: true },
        { input: '5\n1 5 3 7 2\n8', output: '0 3', isHidden: true }
    ],
    constraints: `2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Only one valid answer exists.`,
    codeTemplates: [
        {
            languageId: 71,
            language: 'Python',
            template: `def two_sum(nums, target):
    # Your code here
    pass

# Read input
n = int(input())
nums = list(map(int, input().split()))
target = int(input())

# Call function and print result
result = two_sum(nums, target)
print(result[0], result[1])`
        },
        {
            languageId: 62,
            language: 'Java',
            template: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{0, 0};
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        int target = sc.nextInt();
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}`
        },
        {
            languageId: 54,
            language: 'C++',
            template: `#include <iostream>
#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {0, 0};
}

int main() {
    int n, target;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    cin >> target;
    vector<int> result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}`
        }
    ],
    score: 100,
    timeLimit: 2000,
    memoryLimit: 256,
    isLibrary: true,
    contestId: null
};

async function addTwoSum() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if Two Sum already exists
        const existing = await CodingProblem.findOne({ title: 'Two Sum', isLibrary: true });
        if (existing) {
            console.log('Two Sum already exists in library');
            process.exit(0);
        }

        const problem = await CodingProblem.create(twoSumProblem);
        console.log('✅ Two Sum added to library:', problem._id);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addTwoSum();
