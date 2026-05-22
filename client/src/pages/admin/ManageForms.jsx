import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/authService';
import toast from 'react-hot-toast';
import {
    Plus,
    Edit,
    Trash2,
    ArrowLeft,
    ClipboardList,
    FileText,
    CheckSquare
} from 'lucide-react';

const ManageForms = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [contest, setContest] = useState(null);
    const [forms, setForms] = useState([]);

    useEffect(() => {
        fetchContestAndForms();
    }, [contestId]);

    const fetchContestAndForms = async () => {
        try {
            setLoading(true);
            const [contestRes, formsRes] = await Promise.all([
                api.get(`/contests/${contestId}`),
                api.get(`/forms/contest/${contestId}`)
            ]);
            setContest(contestRes.data.contest);
            setForms(formsRes.data.forms);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load forms');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteForm = async (formId) => {
        if (!window.confirm('Are you sure you want to delete this form? All submissions associated with it will be lost.')) {
            return;
        }

        try {
            await api.delete(`/forms/${formId}`);
            toast.success('Form deleted successfully');
            setForms(prev => prev.filter(f => f._id !== formId));
        } catch (error) {
            console.error('Error deleting form:', error);
            toast.error(error.response?.data?.message || 'Failed to delete form');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-dark-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="p-2 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                                <ClipboardList className="w-8 h-8 text-cyan-400" />
                                Manage Forms
                            </h1>
                            <p className="text-gray-400 mt-1">
                                {contest?.title}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/admin/contest/forms/${contestId}/new`)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Form
                    </button>
                </div>

                {/* Forms List */}
                {forms.length === 0 ? (
                    <div className="card text-center py-16">
                        <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ClipboardList className="w-10 h-10 text-gray-600" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">No Forms Created Yet</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Create custom forms to collect additional information, feedback, or submissions from participants.
                        </p>
                        <button
                            onClick={() => navigate(`/admin/contest/forms/${contestId}/new`)}
                            className="btn-primary"
                        >
                            Create Your First Form
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forms.map((form) => (
                            <div key={form._id} className="card hover:border-cyan-500/50 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-cyan-500/10 rounded-lg">
                                        <FileText className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/contest/forms/${contestId}/${form._id}`)}
                                            className="p-2 hover:bg-dark-600 rounded-lg text-gray-400 hover:text-white transition-colors"
                                            title="Edit Form"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteForm(form._id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                            title="Delete Form"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                                    {form.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                                    {form.description || 'No description provided'}
                                </p>

                                <div className="flex items-center justify-between text-sm text-gray-500 border-t border-dark-700 pt-4">
                                    <div className="flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4" />
                                        <span>{form.totalMarks} Marks</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ClipboardList className="w-4 h-4" />
                                        <span>{form.fields.length} Fields</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageForms;
