import express from 'express';
import {
  getAllContests,
  getContestById,
  createContest,
  updateContest,
  deleteContest,
  registerForContest,
  getMyContests,
  startContest,
  getContestProgress,
  finalSubmitContest,
  trackTime,
  logViolation,
  getContestViolations
} from '../controllers/contest.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.get('/', getAllContests);
router.get('/my-contests', protect, getMyContests);
router.get('/:id', getContestById);
router.post('/', protect, adminOnly, createContest);
router.put('/:id', protect, adminOnly, updateContest);
router.delete('/:id', protect, adminOnly, deleteContest);
router.post('/:id/register', protect, registerForContest);

// New contest flow routes
router.post('/:id/start', protect, startContest);
router.get('/:id/progress', protect, getContestProgress);
router.post('/:id/submit', protect, finalSubmitContest);
router.post('/:id/track-time', protect, trackTime);

// Proctoring routes
router.post('/:id/violation', protect, logViolation);
router.get('/:id/violations', protect, adminOnly, getContestViolations);

export default router;
