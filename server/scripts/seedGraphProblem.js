import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CodingProblem from '../models/CodingProblem.js';
import User from '../models/User.js';

dotenv.config();

const starGraphProblem = {
  title: 'Find Center of Star Graph',
  description: 'There is an undirected **star graph** consisting of `n` nodes labeled from `1` to `n`. A star graph is a graph where there is one **center** node and exactly `n - 1` edges that connect the center node with every other node.\n\nYou are given the graph represented as a list of edges. Return the center of the given star graph.',
  inputFormat: 'The first line contains two integers `n` (the number of nodes) and `m` (the number of edges), space-separated. For a star graph, `m = n - 1`.\nThe next `m` lines contain two integers `u` and `v`, representing an undirected edge between node `u` and node `v`.',
  outputFormat: 'Print a single integer representing the label of the center node of the star graph.',
  constraints: [
    '3 <= n <= 10^5',
    'm == n - 1',
    '1 <= u, v <= n',
    'The given graph is guaranteed to be a valid star graph.'
  ],
  examples: [
    {
      input: '4 3\n1 2\n2 3\n4 2',
      output: '2',
      explanation: 'Node 2 is connected to every other node inside the graph (1, 3, and 4), so 2 is the center.'
    },
    {
      input: '5 4\n1 2\n5 1\n1 3\n1 4',
      output: '1',
      explanation: 'Node 1 is connected to all other nodes (2, 3, 4, 5).'
    }
  ],
  testcases: [
    {
      input: '4 3\n1 2\n2 3\n4 2',
      output: '2',
      hidden: false,
      points: 10
    },
    {
      input: '5 4\n1 2\n5 1\n1 3\n1 4',
      output: '1',
      hidden: false,
      points: 10
    },
    {
      input: '3 2\n1 2\n2 3',
      output: '2',
      hidden: true,
      points: 20
    },
    {
      input: '10 9\n10 1\n10 2\n10 3\n10 4\n10 5\n10 6\n10 7\n10 8\n10 9',
      output: '10',
      hidden: true,
      points: 30
    },
    {
      input: '6 5\n1 6\n2 6\n3 6\n4 6\n5 6',
      output: '6',
      hidden: true,
      points: 30
    }
  ],
  score: 100,
  difficulty: 'EASY',
  category: 'DSA',
  timeLimit: 2,
  memoryLimit: 256,
  tags: ['graph', 'easy']
};

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

    const existingCount = await CodingProblem.countDocuments({ category: 'DSA' });

    const problemDoc = {
      ...starGraphProblem,
      isLibrary: true,
      isPublic: true,
      createdBy: admin._id,
      order: existingCount + 1
    };

    const result = await CodingProblem.create(problemDoc);
    console.log(`\n🎉 Successfully inserted coding problem: "${result.title}" [${result._id}]\n`);
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seed();
