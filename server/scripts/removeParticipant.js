import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import ContestRegistration from '../models/ContestRegistration.js';
import ContestProgress from '../models/ContestProgress.js';
import Result from '../models/Result.js';
import Submission from '../models/Submission.js';
import MCQSubmission from '../models/MCQSubmission.js';
import FormSubmission from '../models/FormSubmission.js';

dotenv.config();

const contestId = '69bae9f92baf13e1ffc4d489';
const emailToRemove = '2505230@kiit.ac.in';

async function removeParticipant() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: emailToRemove });
    if (!user) {
      console.log(`❌ User with email ${emailToRemove} not found.`);
      process.exit(1);
    }
    
    const userId = user._id;
    console.log(`📌 Found user ${user.name} with ID: ${userId}`);

    const query = { userId, contestId };

    const regRes = await ContestRegistration.deleteMany(query);
    console.log(`🗑️ Deleted ${regRes.deletedCount} ContestRegistration records.`);

    const progRes = await ContestProgress.deleteMany(query);
    console.log(`🗑️ Deleted ${progRes.deletedCount} ContestProgress records.`);

    const resultRes = await Result.deleteMany(query);
    console.log(`🗑️ Deleted ${resultRes.deletedCount} Result records.`);

    const subRes = await Submission.deleteMany(query);
    console.log(`🗑️ Deleted ${subRes.deletedCount} Submission records.`);

    const mcqRes = await MCQSubmission.deleteMany(query);
    console.log(`🗑️ Deleted ${mcqRes.deletedCount} MCQSubmission records.`);

    const formRes = await FormSubmission.deleteMany(query);
    console.log(`🗑️ Deleted ${formRes.deletedCount} FormSubmission records.`);
    
    console.log('\n🎉 Successfully removed participant from contest!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

removeParticipant();
