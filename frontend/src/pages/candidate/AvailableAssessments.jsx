import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assessmentService } from '../../services/assessmentService';
import { StatusBadge } from '../../components/StatusBadge';
import { Clock, Calendar, CheckCircle2, Play, Eye } from 'lucide-react';

export const AvailableAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentService.getAll();
      setAssessments(data);
    } catch (err) {
      setError('Failed to fetch available assessments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  return (
    <>
      <header className="topbar">
        <h1 className="topbar-title">Available Assessments</h1>
        <button onClick={loadAssessments} className="btn btn-secondary btn-sm">
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
            <h2 className="card-title">Coding Assessments Schedule</h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {assessments.length} assessments
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>Loading assessments...</p>
          ) : assessments.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '30px' }}>
              No assessments are currently available.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Assessment</th>
                    <th>Duration</th>
                    <th>Schedule Window (UTC)</th>
                    <th>Questions</th>
                    <th>Total Marks</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => {
                    const isUpcoming = a.status === 'Upcoming';
                    const isEnded = a.status === 'Ended';
                    const hasAttempted = a.hasAttempted;
                    const isAttemptInProgress = a.attemptStatus === 'InProgress';

                    return (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>
                          <div>{a.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {a.description}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                            <Clock size={14} color="#64748b" />
                            <span>{a.durationMinutes} mins</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                          <div>From: {new Date(a.startTime).toLocaleString()}</div>
                          <div>To: {new Date(a.endTime).toLocaleString()}</div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{a.questionCount}</td>
                        <td style={{ fontWeight: 600 }}>{a.totalMarks}</td>
                        <td>
                          <StatusBadge status={a.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {hasAttempted && !isAttemptInProgress ? (
                            <Link
                              to={`/candidate/results/${a.attemptId}`}
                              className="btn btn-secondary btn-sm"
                            >
                              <Eye size={13} color="#2563eb" />
                              <span>View Score</span>
                            </Link>
                          ) : isAttemptInProgress ? (
                            <Link
                              to={`/candidate/attempt/${a.attemptId}`}
                              className="btn btn-success btn-sm"
                            >
                              <Play size={13} />
                              <span>Resume</span>
                            </Link>
                          ) : isUpcoming ? (
                            <button className="btn btn-secondary btn-sm" disabled>
                              Starts Soon
                            </button>
                          ) : isEnded ? (
                            <button className="btn btn-secondary btn-sm" disabled>
                              Expired
                            </button>
                          ) : (
                            <Link
                              to={`/candidate/assessments/${a.id}/instructions`}
                              className="btn btn-primary btn-sm"
                            >
                              <Play size={13} />
                              <span>Take Test</span>
                            </Link>
                          )}
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
