import api from './api';

export const codeService = {
  async runCode(questionId, sourceCode, language, customInput) {
    const response = await api.post('/code/run', {
      questionId,
      sourceCode,
      language,
      customInput: customInput || null
    });
    return response.data;
  },

  async submitSolution(assessmentAttemptId, questionId, sourceCode, language) {
    const response = await api.post('/code/submit', {
      assessmentAttemptId,
      questionId,
      sourceCode,
      language
    });
    return response.data;
  },

  async saveDraft(assessmentAttemptId, questionId, language, code) {
    const response = await api.post(`/attempts/${assessmentAttemptId}/save-draft`, {
      assessmentAttemptId,
      questionId,
      language,
      code
    });
    return response.data;
  }
};
