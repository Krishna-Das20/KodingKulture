import express from 'express';
import {
  getMCQsByContest,
  submitMCQAnswers,
  createMCQ,
  updateMCQ,
  deleteMCQ,
  getLibraryMCQs,
  createLibraryMCQ,
  updateLibraryMCQ,
  deleteLibraryMCQ,
  addLibraryMCQsToContest,
  removeMCQFromContest,
  getMCQMetrics,
  getContestMCQReview
} from '../controllers/mcq.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/admin.middleware.js';

const router = express.Router();

// Library routes (must be before /:id routes)
router.get('/library', protect, adminOnly, getLibraryMCQs);
router.post('/library', protect, adminOnly, createLibraryMCQ);
router.put('/library/:id', protect, adminOnly, updateLibraryMCQ);
router.delete('/library/:id', protect, adminOnly, deleteLibraryMCQ);

// Contest-library linking routes
router.post('/contest/:contestId/add-from-library', protect, adminOnly, addLibraryMCQsToContest);
router.delete('/contest/:contestId/mcq/:mcqId', protect, adminOnly, removeMCQFromContest);

// Contest MCQ routes
router.get('/contest/:contestId', protect, getMCQsByContest);
router.get('/contest/:contestId/review', protect, getContestMCQReview);
router.post('/submit', protect, submitMCQAnswers);

// MCQ CRUD routes
router.post('/', protect, adminOnly, createMCQ);
router.put('/:id', protect, adminOnly, updateMCQ);
router.delete('/:id', protect, adminOnly, deleteMCQ);
router.get('/:id/metrics', protect, adminOnly, getMCQMetrics);

export default router;

