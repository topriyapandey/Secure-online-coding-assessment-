import api from './api';

export const resultService = {
  async getMyResults() {
    const response = await api.get('/results/my-results');
    return response.data;
  },

  async getAttemptResult(attemptId) {
    const response = await api.get(`/results/attempt/${attemptId}`);
    return response.data;
  },

  async getLeaderboard(assessmentId) {
    const response = await api.get(`/results/leaderboard/${assessmentId}`);
    return response.data;
  }
};

export const adminService = {
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getCandidates() {
    const response = await api.get('/admin/candidates');
    return response.data;
  },

  async getSubmissions(assessmentId = null) {
    const url = assessmentId ? `/admin/submissions?assessmentId=${assessmentId}` : '/admin/submissions';
    const response = await api.get(url);
    return response.data;
  }
};
