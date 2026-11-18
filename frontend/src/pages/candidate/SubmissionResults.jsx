import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resultService } from '../../services/resultService';
import { StatusBadge } from '../../components/StatusBadge';
import { CheckCircle2, Award, Clock, ArrowLeft, Trophy, Calendar } from 'lucide-react';

export const SubmissionResults = () => {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    resultService.getAttemptResult(attemptId)
      .then(setResult)
      .catch((err) => setError('Failed to retrieve assessment results.'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="page-content">
        <p style={{ color: '#64748b' }}>Evaluating and tabulating results...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="page-content">
        <div style={{ color: '#dc2626', marginBottom: '12px' }}>{error || 'Result not found.'}</div>
        <Link to="/candidate" className="btn btn-secondary btn-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/candidate" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="topbar-title">Assessment Evaluation Result</h1>
        </div>
      </header>

      <div className="page-content">
        <div className="card" style={{ maxWidth: '850px', margin: '0 auto' }}>
          {/* Top Score Banner */}
          <div style={{
            textAlign: 'center',
            padding: '30px 20px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: '#ecfdf5', borderRadius: '50%', marginBottom: '12px' }}>
              <CheckCircle2 size={40} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
              {result.assessmentTitle}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
              Submitted on {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : 'N/A'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Marks Obtained</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>
                  {result.marksObtained} <span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 500 }}>/ {result.totalMarks}</span>
                </div>
              </div>

              <div style={{ width: '1px', backgroundColor: '#e2e8f0' }} />

              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Percentage</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb' }}>
                  {result.percentage}%
                </div>
              </div>

              <div style={{ width: '1px', backgroundColor: '#e2e8f0' }} />

              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
                <div style={{ marginTop: '8px' }}>
                  <StatusBadge status={result.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Table by Question */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>
            Problem-by-Problem Evaluation Breakdown
          </h3>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Language Used</th>
                  <th>Status</th>
                  <th>Test Cases Passed</th>
                  <th>Marks Earned</th>
                </tr>
              </thead>
              <tbody>
                {result.questionResults.map((qr) => (
                  <tr key={qr.questionId}>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>
                      {qr.questionTitle}
                    </td>
                    <td>
                      <span className="badge badge-secondary">{qr.language || 'N/A'}</span>
                    </td>
                    <td>
                      <StatusBadge status={qr.status} />
                    </td>
                    <td>
                      {qr.passedTestCases} / {qr.totalTestCases}
                    </td>
                    <td style={{ fontWeight: 700, color: qr.marksObtained > 0 ? '#16a34a' : '#64748b' }}>
                      {qr.marksObtained} / {qr.maxMarks} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
            <Link to="/candidate/history" className="btn btn-secondary">
              View All Attempts History
            </Link>
            <Link to="/candidate/assessments" className="btn btn-primary">
              Back to Assessments
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
