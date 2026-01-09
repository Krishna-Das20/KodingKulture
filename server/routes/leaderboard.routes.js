import express from 'express';
import {
  getLeaderboard,
  getUserRank,
  getContestStats,
  generateCertificate,
  getUserDetailedStats
} from '../controllers/leaderboard.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:contestId', getLeaderboard);
router.get('/:contestId/rank', protect, getUserRank);
router.get('/:contestId/stats', getContestStats);
router.get('/:contestId/user/:userId/details', protect, getUserDetailedStats);
router.post('/:contestId/certificate', protect, generateCertificate);

export default router;

