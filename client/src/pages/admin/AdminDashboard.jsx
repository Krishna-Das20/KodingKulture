import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import contestService from '../../services/contestService';
import toast from 'react-hot-toast';
import {
  Plus,
  Trophy,
  Users,
  Calendar,
  Code,
  FileQuestion,
  Edit,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalContests: 0,
    liveContests: 0,
    totalParticipants: 0,
    upcomingContests: 0
  });

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/');
      return;
    }
    fetchContests();
  }, [isAdmin]);

  const fetchContests = async () => {
    try {
      const data = await contestService.getAllContests();
      setContests(data.contests);

      // Calculate stats
      const stats = {
        totalContests: data.contests.length,
        liveContests: data.contests.filter(c => c.status === 'LIVE').length,
        upcomingContests: data.contests.filter(c => c.status === 'UPCOMING').length,
        totalParticipants: data.contests.reduce((sum, c) => sum + (c.participants?.length || 0), 0)
      };
      setStats(stats);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching contests:', error);
      toast.error('Failed to load contests');
      setLoading(false);
    }
  };

  const handleDeleteContest = async (contestId) => {
    if (!window.confirm('Are you sure you want to delete this contest? This action cannot be undone.')) {
      return;
    }

    try {
      await contestService.deleteContest(contestId);
      toast.success('Contest deleted successfully');
      fetchContests();
    } catch (error) {
      console.error('Error deleting contest:', error);
      toast.error(error.response?.data?.message || 'Failed to delete contest');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'LIVE':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'UPCOMING':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'ENDED':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
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
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage contests, MCQs, and coding problems</p>
          </div>

          <button
            onClick={() => navigate('/admin/contest/create')}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Contest
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Contests</p>
                <p className="text-3xl font-bold">{stats.totalContests}</p>
              </div>
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-400" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Live Contests</p>
                <p className="text-3xl font-bold text-green-400">{stats.liveContests}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-blue-400">{stats.upcomingContests}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Participants</p>
                <p className="text-3xl font-bold text-purple-400">{stats.totalParticipants}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Contests Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">All Contests</h2>
          </div>

          {contests.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No contests created yet</p>
              <button
                onClick={() => navigate('/admin/contest/create')}
                className="btn-primary"
              >
                Create Your First Contest
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Contest</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Duration</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Participants</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Sections</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contests.map((contest) => (
                    <tr key={contest._id} className="border-b border-dark-700 hover:bg-dark-700/30">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-white">{contest.title}</p>
                          <p className="text-sm text-gray-400 line-clamp-1">{contest.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`badge border ${getStatusColor(contest.status)}`}>
                          {contest.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {new Date(contest.startTime).toLocaleDateString()}
                        <br />
                        <span className="text-sm text-gray-500">
                          {new Date(contest.startTime).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {contest.duration} min
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-white font-semibold">
                            {contest.participants?.length || 0}
                          </span>
                          {contest.maxParticipants && (
                            <span className="text-gray-400">/ {contest.maxParticipants}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          {contest.sections?.mcq?.enabled && (
                            <span className="badge-info text-xs">
                              <FileQuestion className="w-3 h-3 inline mr-1" />
                              MCQ
                            </span>
                          )}
                          {contest.sections?.coding?.enabled && (
                            <span className="badge-success text-xs">
                              <Code className="w-3 h-3 inline mr-1" />
                              Coding
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/contest/${contest._id}`)}
                            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>

                          <button
                            onClick={() => navigate(`/leaderboard/${contest._id}`)}
                            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
                            title="Leaderboard"
                          >
                            <BarChart3 className="w-4 h-4 text-green-400" />
                          </button>

                          <button
                            onClick={() => navigate(`/admin/contest/mcq/${contest._id}`)}
                            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
                            title="Manage MCQs"
                          >
                            <FileQuestion className="w-4 h-4 text-purple-400" />
                          </button>

                          <button
                            onClick={() => navigate(`/admin/contest/coding/${contest._id}`)}
                            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
                            title="Manage Coding Problems"
                          >
                            <Code className="w-4 h-4 text-orange-400" />
                          </button>

                          <button
                            onClick={() => navigate(`/admin/contest/edit/${contest._id}`)}
                            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-yellow-400" />
                          </button>

                          <button
                            onClick={() => handleDeleteContest(contest._id)}
                            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <button
            onClick={() => navigate('/admin/contest/create')}
            className="card hover:border-primary-500 transition-colors text-left"
          >
            <Trophy className="w-8 h-8 text-primary-400 mb-3" />
            <h3 className="text-lg font-bold mb-2">Create Contest</h3>
            <p className="text-gray-400 text-sm">Set up a new coding contest with MCQs and problems</p>
          </button>

          <button
            onClick={() => navigate('/admin/mcq-library')}
            className="card hover:border-purple-500 transition-colors text-left"
          >
            <FileQuestion className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-bold mb-2">MCQ Library</h3>
            <p className="text-gray-400 text-sm">Manage reusable MCQ questions with categories</p>
          </button>

          <button
            onClick={() => navigate('/admin/coding-library')}
            className="card hover:border-orange-500 transition-colors text-left"
          >
            <Code className="w-8 h-8 text-orange-400 mb-3" />
            <h3 className="text-lg font-bold mb-2">Coding Library</h3>
            <p className="text-gray-400 text-sm">Manage reusable coding problems with test cases</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
