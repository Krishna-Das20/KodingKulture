import Contest from '../models/Contest.js';
import Result from '../models/Result.js';

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
