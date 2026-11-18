import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { assessmentService } from '../../services/assessmentService';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export const AssessmentForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationMinutes: 60,
    startTime: '',
    endTime: '',
    totalMarks: 100,
    isPublished: true,
  });

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      assessmentService.getById(id)
        .then((data) => {
          // Format ISO date strings for input datetime-local: YYYY-MM-DDTHH:mm
          const formatForInput = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().slice(0, 16);
          };

          setFormData({
            title: data.title || '',
            description: data.description || '',
            durationMinutes: data.durationMinutes || 60,
            startTime: formatForInput(data.startTime),
            endTime: formatForInput(data.endTime),
            totalMarks: data.totalMarks || 100,
            isPublished: data.isPublished ?? true,
          });
        })
        .catch((err) => {
          setError('Failed to load assessment data.');
        })
        .finally(() => setLoading(false));
    } else {
      // Default dates for new assessment: starts now, ends in 7 days
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const future = new Date();
      future.setDate(future.getDate() + 7);
      future.setMinutes(future.getMinutes() - future.getTimezoneOffset());

      setFormData((prev) => ({
        ...prev,
        startTime: now.toISOString().slice(0, 16),
        endTime: future.toISOString().slice(0, 16),
      }));
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      setError('End date and time must be strictly after the start date and time.');
      return;
    }

    if (formData.durationMinutes <= 0) {
      setError('Duration must be at least 1 minute.');
      return;
    }

    setSubmitting(true);

    const payload = {
      ...formData,
      durationMinutes: parseInt(formData.durationMinutes, 10),
      totalMarks: parseInt(formData.totalMarks, 10),
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
    };

    try {
      if (isEditMode) {
        await assessmentService.update(id, payload);
      } else {
        await assessmentService.create(payload);
      }
      navigate('/admin/assessments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <p style={{ color: '#64748b' }}>Loading assessment...</p>
      </div>
    );
  }

  return (
    <>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/admin/assessments" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="topbar-title">
            {isEditMode ? 'Edit Assessment' : 'Create New Assessment'}
          </h1>
        </div>
      </header>

      <div className="page-content">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', marginBottom: '20px', fontSize: '0.875rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Assessment Title *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Data Structures & Algorithms Online Round"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description & Instructions *</label>
              <textarea
                name="description"
                className="form-textarea"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the assessment instructions, syllabus, rules, etc."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Duration (Minutes) *</label>
                <input
                  type="number"
                  name="durationMinutes"
                  className="form-input"
                  min="1"
                  max="1440"
                  value={formData.durationMinutes}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Marks *</label>
                <input
                  type="number"
                  name="totalMarks"
                  className="form-input"
                  min="1"
                  value={formData.totalMarks}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date & Time (UTC) *</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  className="form-input"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date & Time (UTC) *</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  className="form-input"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px' }}
                />
                <span>Publish immediately (visible to candidates within start/end dates)</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <Link to="/admin/assessments" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Save size={16} />
                <span>{submitting ? 'Saving...' : isEditMode ? 'Update Assessment' : 'Create Assessment'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
