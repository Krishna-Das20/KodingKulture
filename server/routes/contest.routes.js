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
  saveProgress,
  emergencySave,
  logViolation,
  getContestViolations,
  getRegistrationStatus,
  getContestParticipants
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

// Registration routes
router.post('/:id/register', protect, registerForContest);
router.get('/:id/registration-status', protect, getRegistrationStatus);

// Admin participants route
router.get('/:id/participants', protect, adminOnly, getContestParticipants);

// New contest flow routes
router.post('/:id/start', protect, startContest);
router.get('/:id/progress', protect, getContestProgress);
router.post('/:id/submit', protect, finalSubmitContest);
router.post('/:id/track-time', protect, trackTime);
router.post('/:id/save-progress', protect, saveProgress);
router.post('/:id/emergency-save', emergencySave); // No protect - authenticates via body token

// Proctoring routes
router.post('/:id/violation', protect, logViolation);
router.get('/:id/violations', protect, adminOnly, getContestViolations);

export default router;
