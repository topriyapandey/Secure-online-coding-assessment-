import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resultService } from '../../services/resultService';
import { assessmentService } from '../../services/assessmentService';
import { StatusBadge } from '../../components/StatusBadge';
import { Trophy, Medal, Award, Users, Filter } from 'lucide-react';

export const ResultsLeaderboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAssessmentId = searchParams.get('assessmentId') || '';

  const [assessments, setAssessments] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(initialAssessmentId);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    assessmentService.getAll().then((data) => {
      setAssessments(data);
      if (!selectedAssessmentId && data.length > 0) {
        setSelectedAssessmentId(String(data[0].id));
      }
    }).catch(() => {});
  }, []);

  const loadLeaderboard = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const data = await resultService.getLeaderboard(id);
      setLeaderboard(data);
    } catch (err) {
      setError('Failed to load leaderboard for the selected assessment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAssessmentId) {
      loadLeaderboard(selectedAssessmentId);
    }
  }, [selectedAssessmentId]);

  const handleAssessmentChange = (e) => {
    const val = e.target.value;
    setSelectedAssessmentId(val);
    setSearchParams({ assessmentId: val });
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#d97706', fontWeight: 700 }}>
          <Trophy size={16} /> #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontWeight: 700 }}>
          <Medal size={16} /> #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#b45309', fontWeight: 700 }}>
          <Award size={16} /> #3
        </span>
      );
    }
    return <span style={{ fontWeight: 600, color: '#64748b' }}>#{rank}</span>;
  };

  return (
    <>
      <header className="topbar">
        <h1 className="topbar-title">Assessment Results & Leaderboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={16} color="#64748b" />
          <select
            className="form-select"
            style={{ width: '280px', padding: '6px 10px', fontSize: '0.85rem' }}
            value={selectedAssessmentId}
            onChange={handleAssessmentChange}
          >
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

        {leaderboard && (
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">{leaderboard.assessmentTitle} Leaderboard</h2>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                  Maximum Marks: <strong>{leaderboard.totalMarks}</strong> | Total Candidates Completed: <strong>{leaderboard.totalParticipants}</strong>
                </div>
              </div>
            </div>

            {loading ? (
              <p style={{ color: '#64748b' }}>Loading rankings...</p>
            ) : leaderboard.rankings.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '30px' }}>
                No candidate submissions evaluated for this assessment yet.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Rank</th>
                      <th>Candidate Name</th>
                      <th>Email</th>
                      <th>Marks Obtained</th>
                      <th>Total Marks</th>
                      <th>Percentage</th>
                      <th>Completion Status</th>
                      <th>Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.rankings.map((r) => (
                      <tr key={r.candidateId} style={{ backgroundColor: r.rank === 1 ? '#fffbeb' : undefined }}>
                        <td>{getRankBadge(r.rank)}</td>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>
                          {r.candidateName}
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {r.candidateEmail}
                        </td>
                        <td style={{ fontWeight: 700, color: r.marksObtained > 0 ? '#16a34a' : '#64748b' }}>
                          {r.marksObtained}
                        </td>
                        <td>{r.totalMarks}</td>
                        <td style={{ fontWeight: 600 }}>
                          {r.percentage}%
                        </td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {r.submittedAt
                            ? new Date(r.submittedAt).toLocaleDateString() + ' ' + new Date(r.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
