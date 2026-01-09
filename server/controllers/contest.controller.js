import Contest from '../models/Contest.js';
import Result from '../models/Result.js';
import Violation from '../models/Violation.js';

// @desc    Get all contests
// @route   GET /api/contests
// @access  Public
export const getAllContests = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { isPublished: true };
    if (status) {
      query.status = status;
    }

    const contests = await Contest.find(query)
      .sort({ startTime: -1 })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: contests.length,
      contests
    });
  } catch (error) {
    console.error('Get contests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching contests'
    });
  }
};

// @desc    Get single contest
// @route   GET /api/contests/:id
// @access  Public
export const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    res.status(200).json({
      success: true,
      contest
    });
  } catch (error) {
    console.error('Get contest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching contest'
    });
  }
};

// @desc    Create contest
// @route   POST /api/contests
// @access  Private/Admin
export const createContest = async (req, res) => {
  try {
    const contestData = {
      ...req.body,
      createdBy: req.user._id
    };

    const contest = await Contest.create(contestData);

    res.status(201).json({
      success: true,
      message: 'Contest created successfully',
      contest
    });
  } catch (error) {
    console.error('Create contest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating contest'
    });
  }
};

// @desc    Update contest
// @route   PUT /api/contests/:id
// @access  Private/Admin
export const updateContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contest updated successfully',
      contest
    });
  } catch (error) {
    console.error('Update contest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating contest'
    });
  }
};

// @desc    Delete contest
// @route   DELETE /api/contests/:id
// @access  Private/Admin
export const deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contest deleted successfully'
    });
  } catch (error) {
    console.error('Delete contest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting contest'
    });
  }
};

// @desc    Register for contest
// @route   POST /api/contests/:id/register
// @access  Private
export const registerForContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    // Check if already registered
    if (contest.participants.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this contest'
      });
    }

    // Check max participants
    if (contest.maxParticipants && contest.participants.length >= contest.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Contest is full'
      });
    }

    contest.participants.push(req.user._id);
    await contest.save();

    // Create result entry
    await Result.create({
      userId: req.user._id,
      contestId: contest._id,
      status: 'IN_PROGRESS'
    });

    // Return updated contest
    const updatedContest = await Contest.findById(contest._id).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Successfully registered for contest',
      contest: updatedContest
    });
  } catch (error) {
    console.error('Register contest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error registering for contest'
    });
  }
};

// @desc    Get user's registered contests
// @route   GET /api/contests/my-contests
// @access  Private
export const getMyContests = async (req, res) => {
  try {
    const contests = await Contest.find({
      participants: req.user._id
    }).sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      count: contests.length,
      contests
    });
  } catch (error) {
    console.error('Get my contests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching contests'
    });
  }
};

// @desc    Start contest (initialize progress and timer)
// @route   POST /api/contests/:id/start
// @access  Private
export const startContest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    // Check if user is registered
    if (!contest.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not registered for this contest'
      });
    }

    // Check if contest is live
    if (contest.status !== 'LIVE') {
      return res.status(400).json({
        success: false,
        message: 'Contest is not currently live'
      });
    }

    // Import ContestProgress here to avoid circular dependency
    const ContestProgress = (await import('../models/ContestProgress.js')).default;

    // Check if already started
    let progress = await ContestProgress.findOne({ contestId: id, userId });

    if (progress) {
      // Already started, return existing progress
      return res.status(200).json({
        success: true,
        message: 'Contest already started',
        progress,
        remainingTime: Math.max(0, contest.duration * 60 - Math.floor((Date.now() - progress.startedAt) / 1000))
      });
    }

    // Create new progress
    progress = await ContestProgress.create({
      contestId: id,
      userId,
      startedAt: new Date(),
      status: 'IN_PROGRESS'
    });

    res.status(201).json({
      success: true,
      message: 'Contest started',
      progress,
      remainingTime: contest.duration * 60
    });
  } catch (error) {
    console.error('Start contest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error starting contest'
    });
  }
};

// @desc    Get contest progress
// @route   GET /api/contests/:id/progress
// @access  Private
export const getContestProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const ContestProgress = (await import('../models/ContestProgress.js')).default;
    const contest = await Contest.findById(id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    const progress = await ContestProgress.findOne({ contestId: id, userId });

    if (!progress) {
      return res.status(200).json({
        success: true,
        started: false,
        message: 'Contest not started yet'
      });
    }

    const elapsedSeconds = Math.floor((Date.now() - progress.startedAt) / 1000);
    const remainingTime = Math.max(0, contest.duration * 60 - elapsedSeconds);

    res.status(200).json({
      success: true,
      started: true,
      progress,
      remainingTime,
      contest: {
        title: contest.title,
        duration: contest.duration,
        sections: contest.sections
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching progress'
    });
  }
};

// @desc    Final submit contest
// @route   POST /api/contests/:id/submit
// @access  Private
export const finalSubmitContest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { mcqAnswers, codingSubmissions } = req.body;

    const ContestProgress = (await import('../models/ContestProgress.js')).default;
    const MCQSubmission = (await import('../models/MCQSubmission.js')).default;
    const MCQ = (await import('../models/MCQ.js')).default;
    const Submission = (await import('../models/Submission.js')).default;

    const progress = await ContestProgress.findOne({ contestId: id, userId });

    if (!progress) {
      return res.status(400).json({
        success: false,
        message: 'Contest not started'
      });
    }

    if (progress.status === 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: 'Contest already submitted'
      });
    }

    const now = new Date();
    const totalTimeSpent = Math.floor((now - progress.startedAt) / 1000);

    // Update progress
    progress.submittedAt = now;
    progress.totalTimeSpent = totalTimeSpent;
    progress.status = 'SUBMITTED';

    // Save MCQ answers if provided
    if (mcqAnswers && mcqAnswers.length > 0) {
      progress.mcqProgress.answers = mcqAnswers;

      // Also save to MCQSubmission for scoring
      await MCQSubmission.findOneAndUpdate(
        { contestId: id, userId },
        {
          contestId: id,
          userId,
          answers: mcqAnswers,
          submittedAt: now
        },
        { upsert: true, new: true }
      );
    }

    await progress.save();

    // Calculate MCQ Score
    let mcqScore = 0;
    const mcqAnswerDetails = [];
    if (mcqAnswers && mcqAnswers.length > 0) {
      for (const answer of mcqAnswers) {
        const mcq = await MCQ.findById(answer.mcqId);
        if (mcq) {
          const correctAnswers = mcq.options
            .map((opt, idx) => opt.isCorrect ? idx : -1)
            .filter(idx => idx !== -1);

          const userAnswers = answer.selectedOptions || [];
          const isCorrect = userAnswers.length === correctAnswers.length &&
            userAnswers.every(ans => correctAnswers.includes(ans));

          const marksAwarded = isCorrect ? (mcq.marks || 1) : -(mcq.negativeMarks || 0);
          mcqScore += marksAwarded;

          mcqAnswerDetails.push({
            questionId: mcq._id,
            selectedOptions: userAnswers,
            isCorrect,
            marksAwarded
          });
        }
      }
    }

    // Calculate Coding Score from accepted submissions
    let codingScore = 0;
    const codingSubmissionDetails = [];
    const userSubmissions = await Submission.find({
      userId,
      contestId: id,
      verdict: 'ACCEPTED'
    });

    // Group by problemId and get best score per problem
    const problemScores = {};
    for (const sub of userSubmissions) {
      const problemId = sub.problemId.toString();
      if (!problemScores[problemId] || sub.score > problemScores[problemId].score) {
        problemScores[problemId] = sub;
      }
    }

    for (const [problemId, sub] of Object.entries(problemScores)) {
      codingScore += sub.score || 0;
      codingSubmissionDetails.push({
        problemId: sub.problemId,
        bestSubmission: sub._id,
        score: sub.score || 0,
        solved: true
      });
    }

    const totalScore = mcqScore + codingScore;

    // Create or update Result record
    await Result.findOneAndUpdate(
      { contestId: id, userId },
      {
        contestId: id,
        userId,
        mcqScore,
        mcqAnswers: mcqAnswerDetails,
        codingScore,
        codingSubmissions: codingSubmissionDetails,
        totalScore,
        timeTaken: totalTimeSpent,
        startedAt: progress.startedAt,
        submittedAt: now,
        status: 'SUBMITTED'
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Contest submitted successfully',
      totalTimeSpent,
      mcqScore,
      codingScore,
      totalScore,
      progress
    });
  } catch (error) {
    console.error('Final submit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting contest'
    });
  }
};

// @desc    Update question/problem time tracking
// @route   POST /api/contests/:id/track-time
// @access  Private
export const trackTime = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { type, questionId, problemId, timeSpent } = req.body;

    const ContestProgress = (await import('../models/ContestProgress.js')).default;
    const progress = await ContestProgress.findOne({ contestId: id, userId });

    if (!progress) {
      return res.status(400).json({
        success: false,
        message: 'Contest not started'
      });
    }

    if (type === 'mcq') {
      const existingTime = progress.mcqProgress.questionTimes.find(
        q => q.questionId.toString() === questionId
      );
      if (existingTime) {
        // Accumulate time instead of replacing
        existingTime.timeSpent += timeSpent;
        existingTime.answeredAt = new Date();
      } else {
        progress.mcqProgress.questionTimes.push({
          questionId,
          timeSpent,
          startedAt: new Date(),
          answeredAt: new Date()
        });
      }
    } else if (type === 'coding') {
      const pid = problemId || questionId; // Support both field names
      const existingTime = progress.codingProgress.problemTimes.find(
        p => p.problemId.toString() === pid
      );
      if (existingTime) {
        // Accumulate time instead of replacing
        existingTime.timeSpent += timeSpent;
        existingTime.submittedAt = new Date();
      } else {
        progress.codingProgress.problemTimes.push({
          problemId: pid,
          timeSpent,
          startedAt: new Date(),
          submittedAt: new Date()
        });
      }
    } else if (type === 'mcq-section') {
      // Accumulate MCQ section time
      progress.mcqProgress.sectionTimeSpent = (progress.mcqProgress.sectionTimeSpent || 0) + timeSpent;
    } else if (type === 'coding-section') {
      // Accumulate Coding section time
      progress.codingProgress.sectionTimeSpent = (progress.codingProgress.sectionTimeSpent || 0) + timeSpent;
    }

    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Time tracked'
    });
  } catch (error) {
    console.error('Track time error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error tracking time'
    });
  }
};

// @desc    Log proctoring violation
// @route   POST /api/contests/:id/violation
// @access  Private
export const logViolation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { type, details } = req.body;

    const ContestProgress = (await import('../models/ContestProgress.js')).default;

    // Get current progress
    const progress = await ContestProgress.findOne({ contestId: id, userId });

    if (!progress) {
      return res.status(400).json({
        success: false,
        message: 'Contest not started'
      });
    }

    if (progress.status === 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: 'Contest already submitted'
      });
    }

    // Increment warning count
    progress.warningCount = (progress.warningCount || 0) + 1;
    const warningNumber = progress.warningCount;

    // Log the violation
    await Violation.create({
      userId,
      contestId: id,
      type,
      warningNumber,
      details
    });

    // Check if max warnings reached (3 warnings = auto-submit)
    const maxWarnings = 3;
    let autoSubmit = false;

    if (warningNumber >= maxWarnings) {
      progress.status = 'SUBMITTED';
      progress.submittedAt = new Date();
      progress.terminationReason = 'MALPRACTICE';
      autoSubmit = true;
    }

    await progress.save();

    res.status(200).json({
      success: true,
      warningNumber,
      maxWarnings,
      autoSubmit,
      message: autoSubmit
        ? 'Maximum violations reached. Contest auto-submitted.'
        : `Warning ${warningNumber}/${maxWarnings}`
    });
  } catch (error) {
    console.error('Log violation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error logging violation'
    });
  }
};

// @desc    Get violations for a contest (Admin)
// @route   GET /api/contests/:id/violations
// @access  Private/Admin
export const getContestViolations = async (req, res) => {
  try {
    const { id } = req.params;

    const violations = await Violation.find({ contestId: id })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: violations.length,
      violations
    });
  } catch (error) {
    console.error('Get violations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching violations'
    });
  }
};
