import Submission from '../models/Submission.js';
import CodingProblem from '../models/CodingProblem.js';
import Result from '../models/Result.js';
import { LANGUAGE_MAP, LANGUAGE_ID_MAP } from '../config/judge0.js';
import { submitToJudge0, mapStatusToVerdict } from '../services/judge0.service.js';

// @desc    Test run code (without saving)
// @route   POST /api/submissions/test
// @access  Private
export const testRunCode = async (req, res) => {
  try {
    const { problemId, sourceCode, languageId, input } = req.body;

    if (!sourceCode || !languageId) {
      return res.status(400).json({
        success: false,
        message: 'Source code and language are required'
      });
    }

    // Run code with custom input
    try {
      const result = await submitToJudge0(
        sourceCode,
        languageId,
        input || '',
        '' // No expected output for test run
      );

      // Check if we should compare with expected output
      let expectedOutput = null;
      let passed = null;

      // Only compare if problemId is provided and no custom input was given
      if (problemId && !input) {
        const problem = await CodingProblem.findById(problemId);
        if (problem && problem.examples && problem.examples.length > 0) {
          expectedOutput = problem.examples[0].output;
          const actualOutput = (result.stdout || '').trim();
          const expected = expectedOutput.trim();
          passed = actualOutput === expected;
        }
      }

      res.status(200).json({
        success: true,
        output: result.stdout || '',
        error: result.stderr || result.compile_output || null,
        executionTime: result.time ? parseFloat(result.time) * 1000 : 0,
        memoryUsed: result.memory || 0,
        expectedOutput: expectedOutput,
        passed: passed
      });
    } catch (error) {
      console.error('Test run error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute code',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Test run code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Check code against all test cases (without saving)
// @route   POST /api/submissions/check-all
// @access  Private
export const checkAllTestCases = async (req, res) => {
  try {
    const { problemId, sourceCode, languageId } = req.body;

    if (!sourceCode || !languageId || !problemId) {
      return res.status(400).json({
        success: false,
        message: 'Source code, language, and problem ID are required'
      });
    }

    // Get problem with testcases
    const problem = await CodingProblem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Run code against all testcases
    let passedCount = 0;
    const testcaseResults = [];

    for (let i = 0; i < problem.testcases.length; i++) {
      const testcase = problem.testcases[i];
      try {
        const result = await submitToJudge0(
          sourceCode,
          languageId,
          testcase.input,
          testcase.output
        );

        const verdict = mapStatusToVerdict(result.status.id);
        const passed = verdict === 'ACCEPTED';

        if (passed) {
          passedCount++;
        }

        testcaseResults.push({
          testcaseNumber: i + 1,
          passed,
          verdict,
          input: testcase.hidden ? '[Hidden]' : testcase.input,
          expectedOutput: testcase.hidden ? '[Hidden]' : testcase.output,
          actualOutput: testcase.hidden ? '[Hidden]' : (result.stdout || '').trim(),
          executionTime: result.time ? parseFloat(result.time) * 1000 : 0,
          memoryUsed: result.memory || 0,
          error: result.stderr || result.compile_output || null,
          hidden: testcase.hidden
        });
      } catch (error) {
        console.error(`Testcase ${i + 1} execution error:`, error);
        testcaseResults.push({
          testcaseNumber: i + 1,
          passed: false,
          verdict: 'EXECUTION_ERROR',
          error: 'Execution failed',
          hidden: testcase.hidden
        });
      }
    }

    const allPassed = passedCount === problem.testcases.length;

    res.status(200).json({
      success: true,
      allPassed,
      passedCount,
      totalTestcases: problem.testcases.length,
      testcaseResults
    });
  } catch (error) {
    console.error('Check all test cases error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Submit code solution
// @route   POST /api/submissions
// @access  Private
export const submitCode = async (req, res) => {
  try {
    const { contestId, problemId, sourceCode, language, languageId: reqLanguageId } = req.body;

    if (!sourceCode) {
      return res.status(400).json({
        success: false,
        message: 'Source code is required'
      });
    }

    // Resolve language - accept either languageId (number) or language (string)
    let resolvedLanguageId;
    let resolvedLanguage;

    if (reqLanguageId) {
      // Frontend sent languageId (number)
      resolvedLanguageId = reqLanguageId;
      resolvedLanguage = LANGUAGE_ID_MAP[reqLanguageId] || 'python';
    } else if (language) {
      // Frontend sent language (string)
      resolvedLanguage = language;
      resolvedLanguageId = LANGUAGE_MAP[language];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Language is required'
      });
    }

    if (!resolvedLanguageId) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }

    // Get problem with testcases
    const problem = await CodingProblem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Create submission record
    const submission = await Submission.create({
      userId: req.user._id,
      contestId,
      problemId,
      sourceCode,
      language: resolvedLanguage,
      languageId: resolvedLanguageId,
      totalTestcases: problem.testcases.length
    });

    // Run code against testcases
    let passedCount = 0;
    let totalScore = 0;
    const testcaseResults = [];

    for (const testcase of problem.testcases) {
      try {
        const result = await submitToJudge0(
          sourceCode,
          resolvedLanguageId,
          testcase.input,
          testcase.output
        );

        const verdict = mapStatusToVerdict(result.status.id);
        const passed = verdict === 'ACCEPTED';

        if (passed) {
          passedCount++;
          totalScore += testcase.points;
        }

        testcaseResults.push({
          testcaseId: testcase._id,
          passed,
          executionTime: result.time ? parseFloat(result.time) * 1000 : 0,
          memoryUsed: result.memory || 0,
          error: result.stderr || result.compile_output || null
        });

        // Break on first failure for hidden testcases (optional)
        if (!passed && testcase.hidden) {
          submission.verdict = verdict;
          break;
        }
      } catch (error) {
        console.error('Testcase execution error:', error);
        testcaseResults.push({
          testcaseId: testcase._id,
          passed: false,
          error: 'Execution failed'
        });
      }
    }

    // Calculate final verdict
    let finalVerdict = 'ACCEPTED';
    if (passedCount < problem.testcases.length) {
      finalVerdict = testcaseResults[passedCount]?.error?.includes('time')
        ? 'TIME_LIMIT_EXCEEDED'
        : 'WRONG_ANSWER';
    }

    // Update submission
    submission.verdict = finalVerdict;
    submission.score = totalScore;
    submission.testcasesPassed = passedCount;
    submission.testcaseResults = testcaseResults;
    await submission.save();

    // Update problem stats
    problem.submissionCount++;
    if (finalVerdict === 'ACCEPTED') {
      problem.acceptedCount++;
    }
    await problem.save();

    // Update result
    const result = await Result.findOne({ userId: req.user._id, contestId });
    if (result) {
      const problemIndex = result.codingSubmissions.findIndex(
        s => s.problemId.toString() === problemId
      );

      if (problemIndex >= 0) {
        // Update existing
        if (totalScore > result.codingSubmissions[problemIndex].score) {
          result.codingSubmissions[problemIndex].score = totalScore;
          result.codingSubmissions[problemIndex].bestSubmission = submission._id;
        }
        result.codingSubmissions[problemIndex].attempts++;
        result.codingSubmissions[problemIndex].solved = finalVerdict === 'ACCEPTED';
      } else {
        // Add new
        result.codingSubmissions.push({
          problemId,
          bestSubmission: submission._id,
          score: totalScore,
          attempts: 1,
          solved: finalVerdict === 'ACCEPTED'
        });
      }

      // Recalculate total coding score
      result.codingScore = result.codingSubmissions.reduce((sum, s) => sum + s.score, 0);
      result.totalScore = result.mcqScore + result.codingScore;

      await result.save();
    }

    res.status(201).json({
      success: true,
      message: 'Code submitted successfully',
      submission: {
        id: submission._id,
        verdict: submission.verdict,
        score: submission.score,
        testcasesPassed: submission.testcasesPassed,
        totalTestcases: submission.totalTestcases
      }
    });
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting code'
    });
  }
};

// @desc    Get user submissions for a problem
// @route   GET /api/submissions/problem/:problemId
// @access  Private
export const getSubmissionsByProblem = async (req, res) => {
  try {
    const filter = {
      userId: req.user._id,
      problemId: req.params.problemId
    };

    // If contestId is provided, filter by it to avoid cross-contest submission display
    if (req.query.contestId) {
      filter.contestId = req.query.contestId;
    }

    const submissions = await Submission.find(filter).sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching submissions'
    });
  }
};

// @desc    Get submission details
// @route   GET /api/submissions/:id
// @access  Private
export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problemId', 'title')
      .populate('userId', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Only owner or admin can view
    if (submission.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission'
      });
    }

    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching submission'
    });
  }
};
