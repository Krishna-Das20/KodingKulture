import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/authService';
import { Trophy, ChevronRight, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const LeaderboardList = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            const response = await api.get('/contests');
            // Filter to only show contests that have ended or are ongoing
            const now = new Date();
            const relevantContests = (response.data.contests || []).filter(c => {
                const endTime = new Date(c.endTime);
                return endTime <= now || c.status === 'COMPLETED';
            });
            setContests(relevantContests);
        } catch (error) {
            console.error('Error fetching contests:', error);
            toast.error('Failed to load contests');
        } finally {
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

    return (
        <div className="min-h-screen bg-dark-950 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3 mb-2">
                        <Trophy className="w-10 h-10 text-primary-500" />
                        Leaderboards
                    </h1>
                    <p className="text-gray-400">Select a contest to view its leaderboard</p>
                </div>

                {/* Contest List */}
                <div className="space-y-4">
                    {contests.length === 0 ? (
                        <div className="card text-center py-12">
                            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                            <p className="text-gray-400">No completed contests yet</p>
                        </div>
                    ) : (
                        contests.map(contest => (
                            <button
                                key={contest._id}
                                onClick={() => navigate(`/leaderboard/${contest._id}`)}
                                className="w-full card hover:border-primary-500/50 transition-all text-left flex items-center justify-between group"
                            >
                                <div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                                        {contest.title}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(contest.endTime).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {contest.participants?.length || 0} participants
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-primary-400 transition-colors" />
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardList;
