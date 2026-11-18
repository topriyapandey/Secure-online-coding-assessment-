import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assessmentService } from '../../services/assessmentService';
import { ArrowLeft, PlusCircle, Edit2, Trash2, CheckCircle2, EyeOff } from 'lucide-react';

export const QuestionsList = () => {
  const { assessmentId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [assessData, questData] = await Promise.all([
        assessmentService.getById(assessmentId),
        assessmentService.getQuestionsByAssessment(assessmentId)
      ]);
      setAssessment(assessData);
      setQuestions(questData);
    } catch (err) {
      setError('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [assessmentId]);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete question "${title}"?`)) {
      try {
        await assessmentService.deleteQuestion(id);
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete question.');
      }
    }
  };

  return (
    <>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/admin/assessments" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="topbar-title">
            Questions: {assessment?.title || `Assessment #${assessmentId}`}
          </h1>
        </div>
        <Link
          to={`/admin/assessments/${assessmentId}/questions/new`}
          className="btn btn-primary btn-sm"
        >
          <PlusCircle size={15} />
          <span>Add Question</span>
        </Link>
      </header>

      <div className="page-content">
        {error && (
          <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Assessment Programming Problems</h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Total Questions: <strong>{questions.length}</strong> | Combined Marks: <strong>{questions.reduce((sum, q) => sum + q.marks, 0)}</strong>
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>Loading questions...</p>
          ) : questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <p style={{ marginBottom: '12px' }}>No questions added to this assessment yet.</p>
              <Link
                to={`/admin/assessments/${assessmentId}/questions/new`}
                className="btn btn-primary btn-sm"
              >
                Add First Question
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Question Title</th>
                    <th>Difficulty</th>
                    <th>Marks</th>
                    <th>Supported Languages</th>
                    <th>Test Cases</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, idx) => {
                    const sampleCount = q.testCases?.filter((tc) => !tc.isHidden).length || 0;
                    const hiddenCount = q.testCases?.filter((tc) => tc.isHidden).length || 0;

                    return (
                      <tr key={q.id}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>
                          <div>{q.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal', maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {q.problemDescription}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              q.difficulty === 'Easy'
                                ? 'badge-success'
                                : q.difficulty === 'Hard'
                                ? 'badge-danger'
                                : 'badge-warning'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{q.marks} pts</td>
                        <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                          {q.supportedLanguages}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          <span style={{ color: '#059669', marginRight: '8px' }}>
                            {sampleCount} Sample
                          </span>
                          <span style={{ color: '#64748b' }}>
                            {hiddenCount} Hidden
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <Link
                              to={`/admin/assessments/${assessmentId}/questions/${q.id}/edit`}
                              className="btn btn-secondary btn-sm"
                              title="Edit Question"
                            >
                              <Edit2 size={14} />
                            </Link>
                            <button
                              onClick={() => handleDelete(q.id, q.title)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#dc2626' }}
                              title="Delete Question"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
