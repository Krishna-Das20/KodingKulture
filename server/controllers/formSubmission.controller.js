import FormSubmission from '../models/FormSubmission.js';
import Form from '../models/Form.js';
import Contest from '../models/Contest.js';
import User from '../models/User.js';
import { sendMail } from '../services/emailService.js';

// @desc    Submit a form (participant)
// @route   POST /api/form-submissions
// @access  Private
export const submitForm = async (req, res) => {
    try {
        const { formId, contestId, responses } = req.body;

        // Verify form exists
        const form = await Form.findById(formId);
        if (!form) {
            return res.status(404).json({
                success: false,
                message: 'Form not found'
            });
        }

        // Verify contest exists and is live
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Check if user is registered
        if (!contest.participants.includes(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You are not registered for this contest'
            });
        }

        // Check if already submitted
        const existingSubmission = await FormSubmission.findOne({
            formId,
            userId: req.user._id
        });

        if (existingSubmission) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted this form'
            });
        }

        // Create a map of form fields for quick lookup
        const fieldMap = {};
        form.fields.forEach(field => {
            fieldMap[field.fieldId] = field;
        });

        // Process responses and calculate auto-scores
        const processedResponses = responses.map(response => {
            const field = fieldMap[response.fieldId];
            if (!field) return null;

            let autoScore = 0;
            const isAutoScored = field.isAutoScored;

            if (isAutoScored && field.correctAnswers && field.correctAnswers.length > 0) {
                if (field.type === 'RADIO') {
                    // Single correct answer
                    if (response.value === field.correctAnswers[0]) {
                        autoScore = field.marks;
                    }
                } else if (field.type === 'CHECKBOX') {
                    // Multiple correct answers
                    const userAnswers = Array.isArray(response.value) ? response.value : [response.value];
                    const correct = field.correctAnswers;

                    // All correct and no wrong answers = full marks
                    const allCorrect = correct.every(a => userAnswers.includes(a));
                    const noExtra = userAnswers.every(a => correct.includes(a));

                    if (allCorrect && noExtra) {
                        autoScore = field.marks;
                    }
                }
            }

            return {
                fieldId: response.fieldId,
                value: response.value,
                isAutoScored,
                autoScore,
                manualScore: null,
                maxMarks: field.marks,
                isEvaluated: isAutoScored // Auto-scored fields are "evaluated" immediately
            };
        }).filter(r => r !== null);

        const submission = await FormSubmission.create({
            formId,
            contestId,
            userId: req.user._id,
            responses: processedResponses
        });

        res.status(201).json({
            success: true,
            message: 'Form submitted successfully',
            submission: {
                _id: submission._id,
                totalAutoScore: submission.totalAutoScore,
                totalScore: submission.totalScore,
                maxPossibleScore: submission.maxPossibleScore,
                isFullyEvaluated: submission.isFullyEvaluated
            }
        });
    } catch (error) {
        console.error('Submit form error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error submitting form'
        });
    }
};

// @desc    Get all submissions for a contest (admin/organiser)
// @route   GET /api/form-submissions/contest/:contestId
// @access  Private/Admin or Organiser
export const getSubmissionsByContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        const { formId } = req.query;

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Check ownership for organiser
        if (req.user.role === 'ORGANISER' && contest.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const filter = { contestId };
        if (formId) {
            filter.formId = formId;
        }

        const submissions = await FormSubmission.find(filter)
            .populate('userId', 'name email')
            .populate('formId', 'title totalMarks')
            .sort({ submittedAt: -1 });

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

// @desc    Get own submission for a contest (participant)
// @route   GET /api/form-submissions/my/:contestId
// @access  Private
export const getMySubmission = async (req, res) => {
    try {
        const { contestId } = req.params;
        const { formId } = req.query;

        const filter = {
            contestId,
            userId: req.user._id
        };
        if (formId) {
            filter.formId = formId;
        }

        const submissions = await FormSubmission.find(filter)
            .populate('formId', 'title totalMarks fields');

        res.status(200).json({
            success: true,
            submissions
        });
    } catch (error) {
        console.error('Get my submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching submission'
        });
    }
};

// @desc    Evaluate a submission (admin/organiser)
// @route   PUT /api/form-submissions/:id/evaluate
// @access  Private/Admin or Organiser
export const evaluateSubmission = async (req, res) => {
    try {
        const { evaluations } = req.body; // Array of { fieldId, manualScore, feedback }

        const submission = await FormSubmission.findById(req.params.id)
            .populate({
                path: 'formId',
                populate: { path: 'contestId', select: 'createdBy' }
            })
            .populate('userId', 'name email');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Check ownership for organiser
        if (req.user.role === 'ORGANISER') {
            if (submission.formId.contestId.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        }

        // Apply evaluations
        evaluations.forEach(evaluation => {
            const response = submission.responses.find(r => r.fieldId === evaluation.fieldId);
            if (response && !response.isAutoScored) {
                response.manualScore = Math.min(evaluation.manualScore, response.maxMarks);
                response.feedback = evaluation.feedback || '';
                response.isEvaluated = true;
            }
        });

        submission.evaluatedBy = req.user._id;
        submission.evaluatedAt = new Date();

        await submission.save();

        // Send email notification to participant
        try {
            await sendMail({
                to: submission.userId.email,
                subject: `Form Evaluated - ${submission.formId.title}`,
                html: `
          <h2>Your form submission has been evaluated</h2>
          <p>Hello ${submission.userId.name},</p>
          <p>Your submission for <strong>${submission.formId.title}</strong> has been evaluated.</p>
          <p><strong>Score:</strong> ${submission.totalScore} / ${submission.maxPossibleScore}</p>
          <p>Log in to view detailed feedback.</p>
        `
            });
        } catch (emailError) {
            console.error('Failed to send evaluation email:', emailError);
        }

        res.status(200).json({
            success: true,
            message: 'Submission evaluated successfully',
            submission: {
                _id: submission._id,
                totalScore: submission.totalScore,
                totalAutoScore: submission.totalAutoScore,
                totalManualScore: submission.totalManualScore,
                isFullyEvaluated: submission.isFullyEvaluated
            }
        });
    } catch (error) {
        console.error('Evaluate submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error evaluating submission'
        });
    }
};

// @desc    Get submission by ID
// @route   GET /api/form-submissions/:id
// @access  Private/Admin or Organiser
export const getSubmissionById = async (req, res) => {
    try {
        const submission = await FormSubmission.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('formId', 'title fields totalMarks')
            .populate('evaluatedBy', 'name');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Verify access
        const form = await Form.findById(submission.formId._id).populate('contestId', 'createdBy');
        if (req.user.role === 'ORGANISER' && form.contestId.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
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
