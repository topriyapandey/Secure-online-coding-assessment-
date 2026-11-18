import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { assessmentService } from '../../services/assessmentService';
import { ArrowLeft, Save, Plus, Trash2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const QuestionForm = () => {
  const { assessmentId, questionId } = useParams();
  const isEditMode = Boolean(questionId);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    assessmentId: parseInt(assessmentId, 10),
    title: '',
    problemDescription: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    difficulty: 2, // Medium
    supportedLanguages: 'csharp,cpp,java,python',
    marks: 50,
    sampleInput: '',
    sampleExpectedOutput: '',
    testCases: [
      { input: '', expectedOutput: '', isHidden: false, weight: 1 },
      { input: '', expectedOutput: '', isHidden: true, weight: 2 },
    ],
  });

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      assessmentService.getQuestionById(questionId)
        .then((data) => {
          const diffMap = { Easy: 1, Medium: 2, Hard: 3 };
          setFormData({
            assessmentId: data.assessmentId,
            title: data.title || '',
            problemDescription: data.problemDescription || '',
            inputFormat: data.inputFormat || '',
            outputFormat: data.outputFormat || '',
            constraints: data.constraints || '',
            difficulty: diffMap[data.difficulty] || 2,
            supportedLanguages: data.supportedLanguages || 'csharp,cpp,java,python',
            marks: data.marks || 50,
            sampleInput: data.sampleInput || '',
            sampleExpectedOutput: data.sampleExpectedOutput || '',
            testCases: data.testCases && data.testCases.length > 0
              ? data.testCases.map((tc) => ({
                  input: tc.input || '',
                  expectedOutput: tc.expectedOutput || '',
                  isHidden: tc.isHidden ?? true,
                  weight: tc.weight || 1,
                }))
              : [{ input: '', expectedOutput: '', isHidden: false, weight: 1 }],
          });
        })
        .catch((err) => setError('Failed to load question details.'))
        .finally(() => setLoading(false));
    }
  }, [questionId, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'difficulty' || name === 'marks' ? parseInt(value, 10) : value,
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.testCases];
      updated[index] = {
        ...updated[index],
        [field]: field === 'weight' ? parseInt(value, 10) || 1 : value,
      };
      return { ...prev, testCases: updated };
    });
  };

  const addTestCase = (isHidden = true) => {
    setFormData((prev) => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        { input: '', expectedOutput: '', isHidden, weight: isHidden ? 2 : 1 },
      ],
    }));
  };

  const removeTestCase = (index) => {
    if (formData.testCases.length <= 1) {
      alert('A question must have at least one test case.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.testCases.some((tc) => !tc.expectedOutput.trim())) {
      setError('All test cases must have an Expected Output defined.');
      return;
    }

    setSubmitting(true);

    try {
      if (isEditMode) {
        await assessmentService.updateQuestion(questionId, formData);
      } else {
        await assessmentService.createQuestion(formData);
      }
      navigate(`/admin/assessments/${assessmentId}/questions`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <p style={{ color: '#64748b' }}>Loading question...</p>
      </div>
    );
  }

  return (
    <>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to={`/admin/assessments/${assessmentId}/questions`} className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="topbar-title">
            {isEditMode ? 'Edit Programming Question' : 'Add Programming Question'}
          </h1>
        </div>
      </header>

      <div className="page-content">
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', marginBottom: '20px', fontSize: '0.875rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Question Title *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Valid Parentheses Matching"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Problem Statement Description *</label>
              <textarea
                name="problemDescription"
                className="form-textarea"
                rows="5"
                value={formData.problemDescription}
                onChange={handleChange}
                placeholder="Clearly describe the problem requirements, expected algorithm, and edge cases..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Difficulty *</label>
                <select
                  name="difficulty"
                  className="form-select"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option value={1}>Easy</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Marks *</label>
                <input
                  type="number"
                  name="marks"
                  className="form-input"
                  min="1"
                  max="1000"
                  value={formData.marks}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supported Languages</label>
                <input
                  type="text"
                  name="supportedLanguages"
                  className="form-input"
                  value={formData.supportedLanguages}
                  onChange={handleChange}
                  placeholder="csharp,cpp,java,python"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Input Format</label>
                <textarea
                  name="inputFormat"
                  className="form-textarea"
                  rows="2"
                  value={formData.inputFormat}
                  onChange={handleChange}
                  placeholder="e.g. First line contains integer N..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Output Format</label>
                <textarea
                  name="outputFormat"
                  className="form-textarea"
                  rows="2"
                  value={formData.outputFormat}
                  onChange={handleChange}
                  placeholder="e.g. Print 'true' or 'false'..."
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Constraints</label>
              <input
                type="text"
                name="constraints"
                className="form-input"
                value={formData.constraints}
                onChange={handleChange}
                placeholder="e.g. 1 <= N <= 10^5"
              />
            </div>

            {/* Sample Test Case visible on problem statement */}
            <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>
                Sample Input & Expected Output (Visible on Problem Description)
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Sample Input (Stdin)</label>
                  <textarea
                    name="sampleInput"
                    className="form-textarea"
                    rows="3"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                    value={formData.sampleInput}
                    onChange={handleChange}
                    placeholder="Sample input stdin..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sample Expected Output *</label>
                  <textarea
                    name="sampleExpectedOutput"
                    className="form-textarea"
                    rows="3"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                    value={formData.sampleExpectedOutput}
                    onChange={handleChange}
                    placeholder="Sample expected output..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Comprehensive Test Cases (Visible & Hidden) */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>
                    Evaluation Test Cases
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Hidden test cases are used for automatic grading upon submission and will NEVER be leaked to candidate APIs.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => addTestCase(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Eye size={14} color="#059669" />
                    <span>+ Sample Case</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addTestCase(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    <EyeOff size={14} color="#2563eb" />
                    <span>+ Hidden Case</span>
                  </button>
                </div>
              </div>

              {formData.testCases.map((tc, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    backgroundColor: tc.isHidden ? '#f8fafc' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Test Case #{idx + 1}</span>
                      <span className={`badge ${tc.isHidden ? 'badge-secondary' : 'badge-success'}`}>
                        {tc.isHidden ? 'Hidden Evaluation' : 'Visible Sample'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                        />
                        <span>Hidden from candidate</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeTestCase(idx)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#dc2626' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Input (Stdin)</label>
                      <textarea
                        className="form-textarea"
                        rows="2"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                        value={tc.input}
                        onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                        placeholder="Input..."
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Expected Output *</label>
                      <textarea
                        className="form-textarea"
                        rows="2"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                        value={tc.expectedOutput}
                        onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                        placeholder="Expected Output..."
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <Link to={`/admin/assessments/${assessmentId}/questions`} className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Save size={16} />
                <span>{submitting ? 'Saving...' : isEditMode ? 'Update Question' : 'Save Question'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
