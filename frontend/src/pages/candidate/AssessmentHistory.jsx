import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resultService } from '../../services/resultService';
import { StatusBadge } from '../../components/StatusBadge';
import { History, Eye, Calendar, Award } from 'lucide-react';

export const AssessmentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await resultService.getMyResults();
      setHistory(data);
    } catch (err) {
      setError('Failed to load assessment history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <>
      <header className="topbar">
        <h1 className="topbar-title">My Assessment Attempts & Scores</h1>
        <button onClick={loadHistory} className="btn btn-secondary btn-sm">
          Refresh
        </button>
      </header>

      <div className="page-content">
        {error && (
          <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Past Assessment Attempts</h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Total Attempts: <strong>{history.length}</strong>
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>Loading attempt history...</p>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <p style={{ marginBottom: '12px' }}>You have not completed any coding assessments yet.</p>
              <Link to="/candidate/assessments" className="btn btn-primary btn-sm">
                View Available Assessments
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Assessment Title</th>
                    <th>Started At</th>
                    <th>Submitted At</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.attemptId}>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>
                        {h.assessmentTitle}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {new Date(h.startedAt).toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {h.submittedAt ? new Date(h.submittedAt).toLocaleString() : 'In Progress'}
                      </td>
                      <td style={{ fontWeight: 700, color: h.marksObtained > 0 ? '#16a34a' : '#64748b' }}>
                        {h.marksObtained} / {h.totalMarks}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {h.percentage}%
                      </td>
                      <td>
                        <StatusBadge status={h.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {h.status === 'InProgress' ? (
                          <Link to={`/candidate/attempt/${h.attemptId}`} className="btn btn-success btn-sm">
                            Resume
                          </Link>
                        ) : (
                          <Link to={`/candidate/results/${h.attemptId}`} className="btn btn-secondary btn-sm">
                            <Eye size={13} color="#2563eb" />
                            <span>Details</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
