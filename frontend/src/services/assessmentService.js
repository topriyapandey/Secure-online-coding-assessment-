import api from './api';

export const assessmentService = {
  async getAll() {
    const response = await api.get('/assessments');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/assessments/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/assessments', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/assessments/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/assessments/${id}`);
    return response.data;
  },

  async getQuestionsByAssessment(assessmentId) {
    const response = await api.get(`/questions/assessment/${assessmentId}`);
    return response.data;
  },

  async getQuestionById(id) {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  async createQuestion(data) {
    const response = await api.post('/questions', data);
    return response.data;
  },

  async updateQuestion(id, data) {
    const response = await api.put(`/questions/${id}`, data);
    return response.data;
  },

  async deleteQuestion(id) {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },

  async startAttempt(assessmentId) {
    const response = await api.post('/attempts/start', { assessmentId });
    return response.data;
  },

  async getAttempt(attemptId) {
    const response = await api.get(`/attempts/${attemptId}`);
    return response.data;
  },

  async submitAttempt(attemptId) {
    const response = await api.post(`/attempts/${attemptId}/submit`);
    return response.data;
  }
};
