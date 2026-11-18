import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assessmentService } from '../../services/assessmentService';
import { resultService } from '../../services/resultService';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Code, 
  History, 
  Clock, 
  CheckCircle, 
  Play, 
  ArrowRight,
  Award
} from 'lucide-react';

export const CandidateDashboard = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      assessmentService.getAll(),
      resultService.getMyResults()
    ])
      .then(([assessData, historyData]) => {
        setAssessments(assessData);
        setHistory(historyData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const activeAssessments = assessments.filter((a) => a.status === 'Active' && !a.hasAttempted);
  const completedAttempts = history.filter((h) => h.status !== 'InProgress');

  if (loading) {
    return (
      <div className="page-content">
        <p style={{ color: '#64748b' }}>Loading candidate portal...</p>
      </div>
    );
  }

  return (
    <>
      <header className="topbar">
        <h1 className="topbar-title">Candidate Assessment Portal</h1>
      </header>

      <div className="page-content">
        {/* Welcome Banner */}
        <div style={{
          backgroundColor: '#1e293b',
          color: '#ffffff',
          borderRadius: '10px',
          padding: '28px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>
              Welcome back, {user?.fullName || 'Candidate'}!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '550px' }}>
              Solve programming assessments, run code against real test cases in C#, C++, Java, and Python, and receive instant evaluations.
            </p>
          </div>
          <Link to="/candidate/assessments" className="btn btn-primary">
            <Play size={16} />
            <span>Explore Assessments</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <Code size={24} />
            </div>
            <div>
              <div className="stat-value">{activeAssessments.length}</div>
              <div className="stat-label">Assessments Open Now</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="stat-value">{completedAttempts.length}</div>
              <div className="stat-label">Assessments Completed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Award size={24} />
            </div>
            <div>
              <div className="stat-value">
                {completedAttempts.length > 0
                  ? Math.round(completedAttempts.reduce((acc, h) => acc + h.percentage, 0) / completedAttempts.length) + '%'
                  : 'N/A'}
              </div>
              <div className="stat-label">Average Performance</div>
            </div>
          </div>
        </div>

        {/* Active Assessments Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Live Assessments Ready to Take</h3>
            <Link to="/candidate/assessments" style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {activeAssessments.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem', padding: '10px 0' }}>
              No active assessments currently scheduled for you to take.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Assessment Title</th>
                    <th>Duration</th>
                    <th>Questions</th>
                    <th>Total Marks</th>
                    <th>Window Closes</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAssessments.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>
                        <div>{a.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>
                          {a.description}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                          <Clock size={14} color="#64748b" />
                          <span>{a.durationMinutes} mins</span>
                        </div>
                      </td>
                      <td>{a.questionCount}</td>
                      <td style={{ fontWeight: 600 }}>{a.totalMarks}</td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(a.endTime).toLocaleDateString()} {new Date(a.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/candidate/assessments/${a.id}/instructions`}
                          className="btn btn-primary btn-sm"
                        >
                          <Play size={13} />
                          <span>Start Assessment</span>
                        </Link>
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
