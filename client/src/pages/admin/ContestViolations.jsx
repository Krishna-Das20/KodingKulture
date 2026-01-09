import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/authService';
import toast from 'react-hot-toast';
import {
    AlertTriangle,
    User,
    Clock,
    ArrowLeft,
    Shield,
    Monitor,
    MousePointer,
    Copy,
    Clipboard,
    Camera,
    RefreshCw
} from 'lucide-react';

// Map violation types to icons and labels
const violationInfo = {
    TAB_SWITCH: { icon: Monitor, label: 'Tab Switch', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    FULLSCREEN_EXIT: { icon: Monitor, label: 'Fullscreen Exit', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    WINDOW_BLUR: { icon: MousePointer, label: 'Window Blur', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    COPY_ATTEMPT: { icon: Copy, label: 'Copy Attempt', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    PASTE_ATTEMPT: { icon: Clipboard, label: 'Paste Attempt', color: 'text-pink-400', bg: 'bg-pink-500/20' },
    SCREENSHOT_ATTEMPT: { icon: Camera, label: 'Screenshot Attempt', color: 'text-red-400', bg: 'bg-red-500/20' }
};

const ContestViolations = () => {
    const { contestId } = useParams();
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contest, setContest] = useState(null);

    // Group violations by user
    const [groupedByUser, setGroupedByUser] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchViolations();
        fetchContest();
    }, [contestId]);

    const fetchContest = async () => {
        try {
            const response = await api.get(`/contests/${contestId}`);
            setContest(response.data.contest);
        } catch (error) {
            console.error('Error fetching contest:', error);
        }
    };

    const fetchViolations = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/contests/${contestId}/violations`);
            const data = response.data.violations || [];
            setViolations(data);

            // Group by user
            const grouped = {};
            data.forEach(v => {
                const key = v.userId?._id || 'unknown';
                if (!grouped[key]) {
                    grouped[key] = {
                        user: v.userId,
                        violations: [],
                        maxWarning: 0,
                        terminated: false
                    };
                }
                grouped[key].violations.push(v);
                if (v.warningNumber > grouped[key].maxWarning) {
                    grouped[key].maxWarning = v.warningNumber;
                }
                if (v.warningNumber >= 3) {
                    grouped[key].terminated = true;
                }
            });
            setGroupedByUser(grouped);
        } catch (error) {
            toast.error('Failed to fetch violations');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to={`/leaderboard/${contestId}`}
                            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Shield className="w-6 h-6 text-red-500" />
                                Proctoring Violations
                            </h1>
                            {contest && (
                                <p className="text-gray-400 mt-1">{contest.title}</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={fetchViolations}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="card p-4">
                        <div className="text-3xl font-bold text-white">{violations.length}</div>
                        <div className="text-gray-400 text-sm">Total Violations</div>
                    </div>
                    <div className="card p-4">
                        <div className="text-3xl font-bold text-white">{Object.keys(groupedByUser).length}</div>
                        <div className="text-gray-400 text-sm">Users with Violations</div>
                    </div>
                    <div className="card p-4">
                        <div className="text-3xl font-bold text-red-400">
                            {Object.values(groupedByUser).filter(u => u.terminated).length}
                        </div>
                        <div className="text-gray-400 text-sm">Terminated (Malpractice)</div>
                    </div>
                    <div className="card p-4">
                        <div className="text-3xl font-bold text-yellow-400">
                            {violations.filter(v => v.type === 'SCREENSHOT_ATTEMPT').length}
                        </div>
                        <div className="text-gray-400 text-sm">Screenshot Attempts</div>
                    </div>
                </div>

                {violations.length === 0 ? (
                    <div className="card p-12 text-center">
                        <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No Violations Detected</h2>
                        <p className="text-gray-400">All participants followed the proctoring rules.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Users List */}
                        <div className="card p-4 lg:col-span-1">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Violators ({Object.keys(groupedByUser).length})
                            </h2>
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {Object.entries(groupedByUser)
                                    .sort((a, b) => b[1].maxWarning - a[1].maxWarning)
                                    .map(([userId, data]) => (
                                        <button
                                            key={userId}
                                            onClick={() => setSelectedUser(userId)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${selectedUser === userId
                                                    ? 'bg-primary-500/20 border border-primary-500'
                                                    : 'bg-dark-800 hover:bg-dark-700'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-white">
                                                        {data.user?.name || 'Unknown User'}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {data.user?.email}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${data.terminated
                                                            ? 'bg-red-500/20 text-red-400'
                                                            : 'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                        {data.maxWarning}/3
                                                    </span>
                                                    {data.terminated && (
                                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* Violation Details */}
                        <div className="card p-4 lg:col-span-2">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Violation History
                            </h2>

                            {selectedUser && groupedByUser[selectedUser] ? (
                                <div>
                                    {/* User Header */}
                                    <div className={`p-4 rounded-lg mb-4 ${groupedByUser[selectedUser].terminated
                                            ? 'bg-red-500/10 border border-red-500/30'
                                            : 'bg-yellow-500/10 border border-yellow-500/30'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-lg text-white">
                                                    {groupedByUser[selectedUser].user?.name}
                                                </div>
                                                <div className="text-gray-400">
                                                    {groupedByUser[selectedUser].user?.email}
                                                </div>
                                            </div>
                                            {groupedByUser[selectedUser].terminated && (
                                                <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                                                    🚫 TERMINATED - MALPRACTICE
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                        {groupedByUser[selectedUser].violations
                                            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                                            .map((violation, idx) => {
                                                const info = violationInfo[violation.type] || {
                                                    icon: AlertTriangle,
                                                    label: violation.type,
                                                    color: 'text-gray-400',
                                                    bg: 'bg-gray-500/20'
                                                };
                                                const Icon = info.icon;

                                                return (
                                                    <div
                                                        key={violation._id || idx}
                                                        className={`p-4 rounded-lg ${info.bg} border border-dark-600`}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-2 rounded-lg bg-dark-800 ${info.color}`}>
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <div className={`font-semibold ${info.color}`}>
                                                                        Warning #{violation.warningNumber}: {info.label}
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                                                                        <Clock className="w-4 h-4" />
                                                                        {formatTime(violation.timestamp)}
                                                                    </div>
                                                                </div>
                                                                {violation.details && (
                                                                    <div className="text-gray-400 text-sm mt-1">
                                                                        {violation.details}
                                                                    </div>
                                                                )}
                                                                {violation.warningNumber >= 3 && (
                                                                    <div className="mt-2 text-red-400 text-sm font-medium">
                                                                        ⚠️ This violation triggered auto-submission
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Select a user to view their violation details</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestViolations;
