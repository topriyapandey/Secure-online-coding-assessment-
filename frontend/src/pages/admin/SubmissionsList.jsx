import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { assessmentService } from '../../services/assessmentService';
import { StatusBadge } from '../../components/StatusBadge';
import { FileCode2, Eye, X, Filter } from 'lucide-react';

export const SubmissionsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAssessmentId = searchParams.get('assessmentId') || '';

  const [submissions, setSubmissions] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(initialAssessmentId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCodeModal, setActiveCodeModal] = useState(null);

  useEffect(() => {
    assessmentService.getAll().then(setAssessments).catch(() => {});
  }, []);

  const loadSubmissions = async (assessmentId) => {
    try {
      setLoading(true);
      const data = await adminService.getSubmissions(assessmentId ? parseInt(assessmentId, 10) : null);
      setSubmissions(data);
    } catch (err) {
      setError('Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions(selectedAssessmentId);
  }, [selectedAssessmentId]);

  const handleAssessmentFilterChange = (e) => {
    const val = e.target.value;
    setSelectedAssessmentId(val);
    if (val) {
      setSearchParams({ assessmentId: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <>
      <header className="topbar">
        <h1 className="topbar-title">Candidate Code Submissions</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={16} color="#64748b" />
          <select
            className="form-select"
            style={{ width: '250px', padding: '6px 10px', fontSize: '0.85rem' }}
            value={selectedAssessmentId}
            onChange={handleAssessmentFilterChange}
          >
            <option value="">All Assessments</option>
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="page-content">
        {error && (
          <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Submission Audit Trail</h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {submissions.length} submissions
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '30px' }}>
              No submissions found for the selected assessment.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Assessment</th>
                    <th>Question</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Test Cases Passed</th>
                    <th>Marks</th>
                    <th>Submitted At</th>
                    <th style={{ textAlign: 'right' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>
                        <div>{sub.candidateName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>
                          {sub.candidateEmail}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#334155' }}>
                        {sub.assessmentTitle}
                      </td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                        {sub.questionTitle}
                      </td>
                      <td>
                        <span className="badge badge-secondary">{sub.language}</span>
                      </td>
                      <td>
                        <StatusBadge status={sub.status} />
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {sub.passedTestCases} / {sub.totalTestCases}
                      </td>
                      <td style={{ fontWeight: 600, color: sub.marksObtained > 0 ? '#16a34a' : '#dc2626' }}>
                        {sub.marksObtained} pts
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setActiveCodeModal(sub)}
                          className="btn btn-secondary btn-sm"
                          title="Inspect submitted code"
                        >
                          <Eye size={14} />
                          <span>Code</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Code Viewer Modal */}
      {activeCodeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>
                  Submission by {activeCodeModal.candidateName}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Question: {activeCodeModal.questionTitle} | Language: {activeCodeModal.language} | Marks: {activeCodeModal.marksObtained}
                </div>
              </div>
              <button
                onClick={() => setActiveCodeModal(null)}
                className="btn btn-secondary btn-sm"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
              <pre style={{
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                padding: '16px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {activeCodeModal.sourceCode}
              </pre>
            </div>

            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: '#f8fafc'
            }}>
              <button onClick={() => setActiveCodeModal(null)} className="btn btn-primary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
