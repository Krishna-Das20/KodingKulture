import api from './authService';

const adminService = {
  // Contest Management
  createContest: async (contestData) => {
    const response = await api.post('/contests', contestData);
    return response.data;
  },

  updateContest: async (contestId, contestData) => {
    const response = await api.put(`/contests/${contestId}`, contestData);
    return response.data;
  },

  deleteContest: async (contestId) => {
    const response = await api.delete(`/contests/${contestId}`);
    return response.data;
  },

  // MCQ Management
  createMCQ: async (mcqData) => {
    const response = await api.post('/mcq', mcqData);
    return response.data;
  },

  updateMCQ: async (mcqId, mcqData) => {
    const response = await api.put(`/mcq/${mcqId}`, mcqData);
    return response.data;
  },

  deleteMCQ: async (mcqId) => {
    const response = await api.delete(`/mcq/${mcqId}`);
    return response.data;
  },

  // Coding Problem Management
  createCodingProblem: async (problemData) => {
    const response = await api.post('/coding', problemData);
    return response.data;
  },

  updateCodingProblem: async (problemId, problemData) => {
    const response = await api.put(`/coding/${problemId}`, problemData);
    return response.data;
  },

  deleteCodingProblem: async (problemId) => {
    const response = await api.delete(`/coding/${problemId}`);
    return response.data;
  },

  // Remove MCQ from contest (unlink only, don't delete)
  removeMCQFromContest: async (contestId, mcqId) => {
    const response = await api.delete(`/mcq/contest/${contestId}/mcq/${mcqId}`);
    return response.data;
  },

  // Remove Coding Problem from contest (unlink only, don't delete)
  removeCodingFromContest: async (contestId, problemId) => {
    const response = await api.delete(`/coding/contest/${contestId}/problem/${problemId}`);
    return response.data;
  },

  // Statistics
  getAdminStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  }
};

export default adminService;
