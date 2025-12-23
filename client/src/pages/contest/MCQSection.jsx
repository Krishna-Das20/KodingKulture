import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import mcqService from '../../services/mcqService';
import toast from 'react-hot-toast';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, Circle } from 'lucide-react';

const MCQSection = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [mcqs, setMcqs] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [flagged, setFlagged] = useState(new Set());
  const [contestInfo, setContestInfo] = useState(null);

  useEffect(() => {
    fetchMCQs();
  }, [contestId]);

  useEffect(() => {
    if (timeRemaining === null) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const fetchMCQs = async () => {
    try {
      const data = await mcqService.getMCQsByContest(contestId);
      setMcqs(data.mcqs);
      setContestInfo(data.contest);
      
      // Set timer based on contest duration
      if (data.contest && data.contest.duration) {
        setTimeRemaining(data.contest.duration * 60); // Convert to seconds
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching MCQs:', error);
      toast.error(error.response?.data?.message || 'Failed to load questions');
      setLoading(false);
    }
  };

  const handleOptionSelect = (mcqId, optionIndex) => {
    const mcq = mcqs.find(m => m._id === mcqId);
    
    if (!mcq || !mcq.options) return;
    
    // Determine if multiple answers based on options (since correctAnswers might be hidden)
    const correctCount = mcq.options.filter(opt => opt.isCorrect).length;
    const isMultipleAnswer = correctCount > 1;
    
    if (isMultipleAnswer) {
      // Multiple correct answers - toggle selection
      setAnswers(prev => {
        const current = prev[mcqId] || [];
        if (current.includes(optionIndex)) {
          return { ...prev, [mcqId]: current.filter(i => i !== optionIndex) };
        } else {
          return { ...prev, [mcqId]: [...current, optionIndex] };
        }
      });
    } else {
      // Single correct answer
      setAnswers(prev => ({ ...prev, [mcqId]: [optionIndex] }));
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const unanswered = mcqs.filter(mcq => !answers[mcq._id] || answers[mcq._id].length === 0);
    
    if (unanswered.length > 0 && timeRemaining > 0) {
      const confirm = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Are you sure you want to submit?`
      );
      if (!confirm) return;
    }

    setSubmitting(true);

    try {
      const formattedAnswers = Object.keys(answers).map(mcqId => ({
        mcqId,
        selectedOptions: answers[mcqId]
      }));

      const response = await mcqService.submitMCQAnswers(contestId, formattedAnswers);
      
      toast.success('MCQ section submitted successfully!');
      navigate(`/contest/${contestId}/result`);
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error(error.response?.data?.message || 'Failed to submit answers');
      setSubmitting(false);
    }
  };

  const toggleFlag = (index) => {
    setFlagged(prev => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(index)) {
        newFlagged.delete(index);
      } else {
        newFlagged.add(index);
      }
      return newFlagged;
    });
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (mcqs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <button onClick={() => navigate(`/contest/${contestId}`)} className="btn-primary">
            Back to Contest
          </button>
        </div>
      </div>
    );
  }

  const currentMCQ = mcqs[currentQuestion];
  
  // Check if currentMCQ and its properties exist
  if (!currentMCQ || !currentMCQ.options) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading question...</p>
        </div>
      </div>
    );
  }

  // Determine if multiple answers based on options (since correctAnswers is hidden)
  const isMultipleAnswer = currentMCQ.options.filter(opt => opt.isCorrect).length > 1;
  const selectedOptions = answers[currentMCQ._id] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{contestInfo?.title || 'MCQ Section'}</h1>
              <p className="text-gray-400 text-sm">Question {currentQuestion + 1} of {mcqs.length}</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-lg font-mono">
                <Clock className={`w-5 h-5 ${timeRemaining < 300 ? 'text-red-500' : 'text-primary-500'}`} />
                <span className={timeRemaining < 300 ? 'text-red-500' : 'text-white'}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="card">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="badge-primary text-lg">Q{currentQuestion + 1}</span>
                  <span className="badge-secondary">{currentMCQ.difficulty}</span>
                  {currentMCQ.category && (
                    <span className="badge-info">{currentMCQ.category}</span>
                  )}
                </div>
                
                <button
                  onClick={() => toggleFlag(currentQuestion)}
                  className={`p-2 rounded-lg transition-colors ${
                    flagged.has(currentQuestion) 
                      ? 'bg-yellow-500/20 text-yellow-500' 
                      : 'bg-dark-700 text-gray-400 hover:text-yellow-500'
                  }`}
                >
                  <Flag className="w-5 h-5" fill={flagged.has(currentQuestion) ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {currentMCQ.question}
                </p>
                
                {isMultipleAnswer && (
                  <p className="text-sm text-primary-400 mt-2">
                    (Multiple answers possible - select all that apply)
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentMCQ.options.map((option, index) => {
                  const isSelected = selectedOptions.includes(index);
                  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(currentMCQ._id, index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-600 bg-dark-700/50 hover:border-dark-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-500'
                        }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-primary-400 mr-2">{optionLabel}.</span>
                          <span className="text-gray-200">{option.text}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Marks Info */}
              <div className="mt-6 p-4 bg-dark-700/50 rounded-lg flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  Marks: <span className="text-green-400 font-semibold">+{currentMCQ.marks}</span>
                </span>
                {currentMCQ.negativeMarks > 0 && (
                  <span className="text-gray-400">
                    Negative: <span className="text-red-400 font-semibold">-{currentMCQ.negativeMarks}</span>
                  </span>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-dark-700">
                <button
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Previous
                </button>

                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(mcqs.length - 1, prev + 1))}
                  disabled={currentQuestion === mcqs.length - 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Question Palette */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-lg font-bold mb-4">Question Palette</h3>
              
              <div className="grid grid-cols-5 gap-2 mb-6">
                {mcqs.map((mcq, index) => {
                  const isAnswered = answers[mcq._id] && answers[mcq._id].length > 0;
                  const isFlagged = flagged.has(index);
                  const isCurrent = index === currentQuestion;

                  return (
                    <button
                      key={mcq._id}
                      onClick={() => setCurrentQuestion(index)}
                      className={`aspect-square rounded-lg text-sm font-semibold transition-all relative ${
                        isCurrent
                          ? 'bg-primary-500 text-white scale-110'
                          : isAnswered
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                      }`}
                    >
                      {index + 1}
                      {isFlagged && (
                        <Flag className="w-3 h-3 absolute top-0.5 right-0.5 text-yellow-500" fill="currentColor" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-green-500/20 border border-green-500/50"></div>
                  <span className="text-gray-400">Answered ({Object.keys(answers).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-dark-700"></div>
                  <span className="text-gray-400">Not Answered ({mcqs.length - Object.keys(answers).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-dark-700 relative">
                    <Flag className="w-3 h-3 absolute top-0.5 right-0.5 text-yellow-500" fill="currentColor" />
                  </div>
                  <span className="text-gray-400">Flagged ({flagged.size})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQSection;
