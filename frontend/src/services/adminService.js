import api from './api';

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
