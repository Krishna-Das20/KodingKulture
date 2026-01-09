import express from 'express';
import {
  submitCode,
  getSubmissionsByProblem,
  getSubmissionById,
  testRunCode,
  checkAllTestCases
} from '../controllers/submission.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { submissionLimiter } from '../middlewares/security.middleware.js';

const router = express.Router();

// Submission routes with rate limiting (10 per 5 minutes)
router.post('/', protect, submissionLimiter, submitCode);
router.post('/test', protect, submissionLimiter, testRunCode);
router.post('/check-all', protect, submissionLimiter, checkAllTestCases);
router.get('/problem/:problemId', protect, getSubmissionsByProblem);
router.get('/:id', protect, getSubmissionById);

export default router;
