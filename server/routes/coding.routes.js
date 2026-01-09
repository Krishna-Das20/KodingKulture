import express from 'express';
import {
  getCodingProblemsByContest,
  getCodingProblemById,
  createCodingProblem,
  updateCodingProblem,
  deleteCodingProblem,
  getLibraryProblems,
  createLibraryProblem,
  updateLibraryProblem,
  deleteLibraryProblem,
  addLibraryProblemsToContest,
  removeProblemFromContest,
  getProblemMetrics
} from '../controllers/coding.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/admin.middleware.js';

const router = express.Router();

// Library routes (must be before /:id routes)
router.get('/library', protect, adminOnly, getLibraryProblems);
router.post('/library', protect, adminOnly, createLibraryProblem);
router.put('/library/:id', protect, adminOnly, updateLibraryProblem);
router.delete('/library/:id', protect, adminOnly, deleteLibraryProblem);

// Contest-library linking routes
router.post('/contest/:contestId/add-from-library', protect, adminOnly, addLibraryProblemsToContest);
router.delete('/contest/:contestId/problem/:problemId', protect, adminOnly, removeProblemFromContest);

// Contest routes
router.get('/contest/:contestId', protect, getCodingProblemsByContest);

// Problem CRUD routes
router.get('/:id', protect, getCodingProblemById);
router.post('/', protect, adminOnly, createCodingProblem);
router.put('/:id', protect, adminOnly, updateCodingProblem);
router.delete('/:id', protect, adminOnly, deleteCodingProblem);
router.get('/:id/metrics', protect, adminOnly, getProblemMetrics);

export default router;

