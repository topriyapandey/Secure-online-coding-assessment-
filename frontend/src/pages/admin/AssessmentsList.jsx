import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assessmentService } from '../../services/assessmentService';
import { StatusBadge } from '../../components/StatusBadge';
import { PlusCircle, Edit2, Trash2, ListOrdered, Trophy, Calendar, Clock } from 'lucide-react';

export const AssessmentsList = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentService.getAll();
      setAssessments(data);
    } catch (err) {
      setError('Failed to fetch assessments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete assessment "${title}"? All associated questions and candidate attempts will be removed.`)) {
      try {
        await assessmentService.delete(id);
        setAssessments((prev) => prev.filter((a) => a.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete assessment.');
      }
    }
  };

  return (
    <>
      <header className="topbar">
        <h1 className="topbar-title">Manage Assessments</h1>
        <Link to="/admin/assessments/new" className="btn btn-primary btn-sm">
          <PlusCircle size={15} />
          <span>Create Assessment</span>
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
            <h2 className="card-title">All Programming Assessments</h2>
            <button onClick={loadAssessments} className="btn btn-secondary btn-sm">
              Refresh List
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>Loading assessments...</p>
          ) : assessments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <p style={{ marginBottom: '12px' }}>No assessments created yet.</p>
              <Link to="/admin/assessments/new" className="btn btn-primary btn-sm">
                Create First Assessment
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Duration</th>
                    <th>Schedule Window</th>
                    <th>Total Marks</th>
                    <th>Questions</th>
                    <th>Status</th>
                    <th>Published</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => (
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
                        <div>Start: {new Date(a.startTime).toLocaleDateString()} {new Date(a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div>End: {new Date(a.endTime).toLocaleDateString()} {new Date(a.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{a.totalMarks}</td>
                      <td>
                        <Link
                          to={`/admin/assessments/${a.id}/questions`}
                          style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <ListOrdered size={14} />
                          <span>{a.questionCount} {a.questionCount === 1 ? 'Question' : 'Questions'}</span>
                        </Link>
                      </td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                      <td>
                        <span className={`badge ${a.isPublished ? 'badge-success' : 'badge-secondary'}`}>
                          {a.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <Link
                            to={`/admin/assessments/${a.id}/questions`}
                            className="btn btn-secondary btn-sm"
                            title="Manage Questions"
                          >
                            <ListOrdered size={14} />
                          </Link>
                          <Link
                            to={`/admin/results?assessmentId=${a.id}`}
                            className="btn btn-secondary btn-sm"
                            title="View Rankings"
                          >
                            <Trophy size={14} color="#d97706" />
                          </Link>
                          <Link
                            to={`/admin/assessments/${a.id}/edit`}
                            className="btn btn-secondary btn-sm"
                            title="Edit Assessment"
                          >
                            <Edit2 size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete(a.id, a.title)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#dc2626' }}
                            title="Delete Assessment"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
