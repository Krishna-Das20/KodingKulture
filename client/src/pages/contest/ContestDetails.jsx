import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import contestService from '../../services/contestService';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import { Calendar, Clock, Users, Award, FileText, Code2, CheckCircle, Play } from 'lucide-react';
import { formatDate } from '../../utils/formatTime';
import toast from 'react-hot-toast';
import api from '../../services/authService';

const ContestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [starting, setStarting] = useState(false);
  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    fetchContestDetails();
    if (isAuthenticated) {
      fetchUserProgress();
    }
  }, [id, isAuthenticated]);

  const fetchContestDetails = async () => {
    try {
      const data = await contestService.getContestById(id);
      setContest(data.contest);
    } catch (error) {
      toast.error('Failed to fetch contest details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await api.get(`/contests/${id}/progress`);
      setUserProgress(response.data.progress);
    } catch (error) {
      // No progress means user hasn't started the contest
      setUserProgress(null);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register');
      navigate('/login');
      return;
    }

    try {
      setRegistering(true);
      const response = await contestService.registerForContest(id);
      toast.success('Successfully registered for contest!');
      // Update contest with the returned data or refetch
      if (response.contest) {
        setContest(response.contest);
      } else {
        await fetchContestDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleStartContest = async () => {
    try {
      setStarting(true);
      await api.post(`/contests/${id}/start`);
      navigate(`/contest/${id}/hub`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start contest');
      setStarting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="card text-center">
          <p className="text-gray-400 text-lg">Contest not found</p>
        </div>
      </div>
    );
  }

  // More robust registration check - backend sends 'id' not '_id'
  const userId = user?.id || user?._id;
  const isRegistered = userId && contest.participants ?
    contest.participants.some(participantId => {
      const pid = typeof participantId === 'object' ? participantId._id || participantId.id || participantId : participantId;
      return pid?.toString() === userId?.toString();
    }) : false;

  const isLive = contest.status === 'LIVE';
  const isEnded = contest.status === 'ENDED';

  // Debug logging
  console.log('Registration Debug:', {
    userId: userId,
    userIdString: userId?.toString(),
    userObject: user,
    participants: contest.participants,
    participantsStrings: contest.participants?.map(p => p?.toString()),
    isRegistered,
    isAuthenticated,
    isLive,
    isEnded,
    contestStatus: contest.status
  });

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Status Badge */}
        <div className="mb-6">
          {contest.status === 'LIVE' && <span className="badge-success text-lg">🔴 LIVE NOW</span>}
          {contest.status === 'UPCOMING' && <span className="badge-warning text-lg">🕒 UPCOMING</span>}
          {contest.status === 'ENDED' && <span className="badge-error text-lg">✓ ENDED</span>}
        </div>

        {/* Title & Description */}
        <div className="card mb-6">
          <h1 className="text-4xl font-bold text-white mb-4">{contest.title}</h1>
          <p className="text-gray-400 text-lg mb-6">{contest.description}</p>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 bg-dark-800 p-4 rounded-lg">
              <Calendar className="w-6 h-6 text-primary-500" />
              <div>
                <div className="text-sm text-gray-400">Start Time</div>
                <div className="text-white font-semibold">{formatDate(contest.startTime)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-dark-800 p-4 rounded-lg">
              <Clock className="w-6 h-6 text-primary-500" />
              <div>
                <div className="text-sm text-gray-400">Duration</div>
                <div className="text-white font-semibold">{contest.duration} minutes</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-dark-800 p-4 rounded-lg">
              <Users className="w-6 h-6 text-primary-500" />
              <div>
                <div className="text-sm text-gray-400">Participants</div>
                <div className="text-white font-semibold">{contest.participants?.length || 0} registered</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-dark-800 p-4 rounded-lg">
              <Award className="w-6 h-6 text-primary-500" />
              <div>
                <div className="text-sm text-gray-400">Total Marks</div>
                <div className="text-white font-semibold">
                  {(contest.sections.mcq?.totalMarks || 0) + (contest.sections.coding?.totalMarks || 0)} points
                </div>
              </div>
            </div>
          </div>

          {/* Sections Preview */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {contest.sections.mcq?.enabled && (
              <div className="bg-dark-800 p-4 rounded-lg border border-dark-700">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-primary-500" />
                  <h3 className="text-lg font-semibold text-white">MCQ Section</h3>
                </div>
                <p className="text-gray-400 text-sm">Marks: {contest.sections.mcq.totalMarks}</p>
              </div>
            )}
            {contest.sections.coding?.enabled && (
              <div className="bg-dark-800 p-4 rounded-lg border border-dark-700">
                <div className="flex items-center gap-3 mb-2">
                  <Code2 className="w-6 h-6 text-primary-500" />
                  <h3 className="text-lg font-semibold text-white">Coding Section</h3>
                </div>
                <p className="text-gray-400 text-sm">Marks: {contest.sections.coding.totalMarks}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            {/* Not registered yet */}
            {!isRegistered && !isEnded && (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="btn-primary flex-1 py-3 text-lg font-semibold"
              >
                {registering ? 'Registering...' : 'Register for Contest'}
              </button>
            )}

            {/* Registered but NOT submitted - show Start Contest */}
            {isRegistered && !isEnded && userProgress?.status !== 'SUBMITTED' && (
              <div className="flex-1 flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Registered</span>
                </div>
                {isLive && (
                  <button
                    onClick={handleStartContest}
                    disabled={starting}
                    className="btn-primary flex-1 py-3 text-lg font-semibold glow-effect flex items-center justify-center gap-2"
                  >
                    {starting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Start Contest
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Submitted users - show View Details buttons */}
            {isRegistered && userProgress?.status === 'SUBMITTED' && (
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Contest Submitted</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/leaderboard/${id}`)}
                    className="btn-primary flex-1 py-3 text-lg font-semibold"
                  >
                    View Leaderboard
                  </button>
                  <button
                    onClick={() => navigate(`/contest/${id}/review`)}
                    className="btn-secondary flex-1 py-3 text-lg font-semibold"
                  >
                    Review Answers
                  </button>
                </div>
              </div>
            )}

            {/* Contest ended - show leaderboard */}
            {isEnded && !userProgress?.status && (
              <button
                onClick={() => navigate(`/leaderboard/${id}`)}
                className="btn-primary flex-1 py-3 text-lg font-semibold"
              >
                View Leaderboard
              </button>
            )}
          </div>
        </div>

        {/* Rules */}
        {contest.rules && contest.rules.length > 0 && (
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4">Contest Rules</h2>
            <ul className="space-y-2">
              {contest.rules.map((rule, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-400">
                  <span className="text-primary-500 font-bold">{index + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestDetails;
