import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Users, Mail, Calendar, Hash } from 'lucide-react';

export const CandidatesList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCandidates();
      setCandidates(data);
    } catch (err) {
      setError('Failed to fetch candidate list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  return (
    <>
      <header className="topbar">
        <h1 className="topbar-title">Registered Candidates</h1>
        <button onClick={loadCandidates} className="btn btn-secondary btn-sm">
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
            <h2 className="card-title">Candidate Directory</h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Total Candidates: <strong>{candidates.length}</strong>
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>Loading candidates...</p>
          ) : candidates.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '30px' }}>
              No candidates registered yet.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Email Address</th>
                    <th>Registered At</th>
                    <th>Assessments Attempted</th>
                    <th>Total Solutions Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                            {c.fullName?.charAt(0) || 'C'}
                          </div>
                          <span>{c.fullName}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                          <Mail size={14} color="#64748b" />
                          <span>{c.email}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <span className="badge badge-info">{c.totalAttempts} attempts</span>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{c.totalSubmissions} submissions</span>
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
