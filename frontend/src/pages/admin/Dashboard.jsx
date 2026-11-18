import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { 
  Users, 
  FolderKanban, 
  Activity, 
  FileCode2, 
  PlusCircle, 
  Trophy, 
  Clock 
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getStats()
      .then((data) => setStats(data))
      .catch((err) => setError('Failed to load dashboard statistics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-content">
        <p style={{ color: '#64748b' }}>Loading dashboard analytics...</p>
      </div>
    );
  }

  return (
    <>
      <header className="topbar">
        <h1 className="topbar-title">Administrator Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/assessments/new" className="btn btn-primary btn-sm">
            <PlusCircle size={15} />
            <span>New Assessment</span>
          </Link>
        </div>
      </header>

      <div className="page-content">
        {error && (
          <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Key Metrics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.totalCandidates ?? 0}</div>
              <div className="stat-label">Registered Candidates</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
              <FolderKanban size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.totalAssessments ?? 0}</div>
              <div className="stat-label">Total Assessments</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <Activity size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.activeAssessments ?? 0}</div>
              <div className="stat-label">Active Assessments</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
              <FileCode2 size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.totalSubmissions ?? 0}</div>
              <div className="stat-label">Total Submissions</div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Assessment Activity</h2>
            </div>
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.recentActivities.map((act, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, color: '#1e293b', fontSize: '0.9rem' }}>
                        {act.description}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                        <Clock size={12} />
                        <span>{new Date(act.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No recent activity recorded yet.</p>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Quick Navigation</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/admin/assessments" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <FolderKanban size={16} color="#2563eb" />
                <span>Manage All Assessments</span>
              </Link>
              <Link to="/admin/candidates" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Users size={16} color="#059669" />
                <span>View Candidates</span>
              </Link>
              <Link to="/admin/submissions" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <FileCode2 size={16} color="#ea580c" />
                <span>Review Code Submissions</span>
              </Link>
              <Link to="/admin/results" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Trophy size={16} color="#d97706" />
                <span>Check Rankings & Leaderboards</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
