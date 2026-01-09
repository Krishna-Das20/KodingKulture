import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/authService';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Minus,
    Trophy,
    FileText,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const ContestReview = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [mcqReview, setMcqReview] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviewData();
    }, [contestId]);

    const fetchReviewData = async () => {
        try {
            const [mcqRes, resultRes] = await Promise.all([
                api.get(`/mcq/contest/${contestId}/review`),
                api.get(`/leaderboard/${contestId}/rank`)
            ]);

            setMcqReview(mcqRes.data.review || []);
            setResult(resultRes.data.result);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching review:', error);
            toast.error('Failed to load review data');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (mcqReview.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <div className="text-center card max-w-md">
                    <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">No Review Data</h2>
                    <p className="text-gray-400 mb-6">Review data is not available yet.</p>
                    <Link to={`/leaderboard/${contestId}`} className="btn-primary">
                        View Leaderboard
                    </Link>
                </div>
            </div>
        );
    }

    const currentMCQ = mcqReview[currentQuestion];
    const userAnswer = currentMCQ?.userAnswer || [];
    const correctAnswers = currentMCQ?.correctAnswers || [];
    const isCorrect = currentMCQ?.isCorrect;
    const isUnanswered = userAnswer.length === 0;

    // Calculate summary
    const correct = mcqReview.filter(m => m.isCorrect).length;
    const wrong = mcqReview.filter(m => !m.isCorrect && m.userAnswer?.length > 0).length;
    const unanswered = mcqReview.filter(m => !m.userAnswer || m.userAnswer.length === 0).length;

    return (
        <div className="min-h-screen bg-dark-950 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>

                    <h1 className="text-3xl font-bold text-white mb-2">Review Your Answers</h1>
                    <p className="text-gray-400">See how you performed in the MCQ section</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="card bg-dark-800/50 text-center p-4">
                        <p className="text-2xl font-bold text-primary-500">{result?.mcqScore || 0}</p>
                        <p className="text-sm text-gray-400">MCQ Score</p>
                    </div>
                    <div className="card bg-green-500/10 text-center p-4">
                        <p className="text-2xl font-bold text-green-500">{correct}</p>
                        <p className="text-sm text-gray-400">Correct</p>
                    </div>
                    <div className="card bg-red-500/10 text-center p-4">
                        <p className="text-2xl font-bold text-red-500">{wrong}</p>
                        <p className="text-sm text-gray-400">Wrong</p>
                    </div>
                    <div className="card bg-gray-500/10 text-center p-4">
                        <p className="text-2xl font-bold text-gray-400">{unanswered}</p>
                        <p className="text-sm text-gray-400">Unanswered</p>
                    </div>
                </div>

                {/* Question Review */}
                <div className="card mb-6">
                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="badge-primary text-lg">Q{currentQuestion + 1}</span>
                            <span className="badge-secondary">{currentMCQ.difficulty}</span>
                            {currentMCQ.category && (
                                <span className="badge-info">{currentMCQ.category}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {isUnanswered ? (
                                <span className="flex items-center gap-1 text-gray-400">
                                    <Minus className="w-5 h-5" />
                                    Unanswered
                                </span>
                            ) : isCorrect ? (
                                <span className="flex items-center gap-1 text-green-500">
                                    <CheckCircle className="w-5 h-5" />
                                    Correct
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-red-500">
                                    <XCircle className="w-5 h-5" />
                                    Wrong
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Question Text */}
                    <div className="mb-6">
                        <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap">
                            {currentMCQ.question}
                        </p>
                        {/* Question Image (if exists) */}
                        {currentMCQ.imageUrl && (
                            <div className="mt-4">
                                <img
                                    src={currentMCQ.imageUrl}
                                    alt="Question"
                                    className="max-w-full max-h-80 rounded-lg border border-dark-600"
                                />
                            </div>
                        )}
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentMCQ.options.map((option, index) => {
                            const isUserSelected = userAnswer.includes(index);
                            const isCorrectAnswer = correctAnswers.includes(index);
                            const optionLabel = String.fromCharCode(65 + index);

                            let optionClass = 'border-dark-600 bg-dark-700/50';
                            let iconElement = null;

                            if (isCorrectAnswer) {
                                optionClass = 'border-green-500 bg-green-500/10';
                                iconElement = <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />;
                            } else if (isUserSelected && !isCorrectAnswer) {
                                optionClass = 'border-red-500 bg-red-500/10';
                                iconElement = <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
                            }

                            return (
                                <div
                                    key={index}
                                    className={`w-full p-4 rounded-lg border-2 ${optionClass}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="font-semibold text-primary-400">{optionLabel}.</span>
                                        <span className="text-gray-200 flex-1">{option.text}</span>
                                        {iconElement}
                                        {isUserSelected && (
                                            <span className="text-xs text-gray-500 bg-dark-600 px-2 py-1 rounded">
                                                Your answer
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    {currentMCQ.explanation && (
                        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <h4 className="font-semibold text-blue-400 mb-2">Explanation</h4>
                            <p className="text-gray-300">{currentMCQ.explanation}</p>
                        </div>
                    )}

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

                        <span className="text-gray-400">
                            {currentQuestion + 1} / {mcqReview.length}
                        </span>

                        <button
                            onClick={() => setCurrentQuestion(prev => Math.min(mcqReview.length - 1, prev + 1))}
                            disabled={currentQuestion === mcqReview.length - 1}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                </div>

                {/* Question Palette */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-4">Question Palette</h3>
                    <div className="grid grid-cols-10 gap-2">
                        {mcqReview.map((mcq, index) => {
                            const isAnswered = mcq.userAnswer && mcq.userAnswer.length > 0;
                            const correct = mcq.isCorrect;
                            const isCurrent = index === currentQuestion;

                            let bgColor = 'bg-dark-700 text-gray-400'; // Unanswered
                            if (isAnswered) {
                                bgColor = correct ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500';
                            }
                            if (isCurrent) {
                                bgColor += ' ring-2 ring-primary-500';
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => setCurrentQuestion(index)}
                                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${bgColor}`}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex items-center gap-6 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded bg-green-500/20"></div> Correct
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded bg-red-500/20"></div> Wrong
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded bg-dark-700"></div> Unanswered
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-center gap-4">
                    <Link to={`/leaderboard/${contestId}`} className="btn-primary">
                        <Trophy className="w-5 h-5 mr-2" />
                        View Leaderboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ContestReview;
