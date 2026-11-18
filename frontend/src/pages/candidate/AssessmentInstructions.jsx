import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { assessmentService } from '../../services/assessmentService';
import { ArrowLeft, Play, Clock, AlertTriangle, CheckSquare, ShieldAlert } from 'lucide-react';

export const AssessmentInstructions = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    assessmentService.getById(assessmentId)
      .then(setAssessment)
      .catch((err) => setError('Failed to load assessment details.'))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  const handleStartAssessment = async () => {
    if (!agreed) {
      alert('Please check the confirmation box to agree to the assessment guidelines.');
      return;
    }

    setStarting(true);
    setError('');

    try {
      const data = await assessmentService.startAttempt(assessmentId);
      // Navigate to the online coding environment with the attempt ID
      navigate(`/candidate/attempt/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to start assessment.');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <p style={{ color: '#64748b' }}>Loading assessment overview...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="page-content">
        <p style={{ color: '#dc2626' }}>Assessment not found or unavailable.</p>
        <Link to="/candidate/assessments" className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
          Back to Assessments
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/candidate/assessments" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="topbar-title">Assessment Guidelines</h1>
        </div>
      </header>

      <div className="page-content">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            {assessment.title}
          </h2>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
            {assessment.description}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Duration</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={18} color="#2563eb" />
                <span>{assessment.durationMinutes} Minutes</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Marks</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                {assessment.totalMarks} Points
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Questions</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                {assessment.questions?.length || 0} Problems
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>
            Rules and Instructions
          </h3>

          <ul style={{ paddingLeft: '20px', color: '#334155', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '24px' }}>
            <li><strong>Timer Enforcement:</strong> The timer runs continuously on the server from the moment you click "Start Assessment". Navigating away does not pause your timer.</li>
            <li><strong>Code Execution:</strong> You may test your code against visible sample test cases as many times as you like using the <em>Run Code</em> button.</li>
            <li><strong>Evaluation & Scoring:</strong> When you click <em>Submit Solution</em>, your code will be compiled and evaluated against hidden test cases in an isolated Judge0 execution sandbox.</li>
            <li><strong>Autosave:</strong> Your draft code is saved automatically to the server periodically.</li>
            <li><strong>Automatic Submission:</strong> If the timer expires before you manually finish, your latest submissions are automatically finalized.</li>
          </ul>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', marginBottom: '20px', fontSize: '0.9rem' }}>
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe', marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#1e40af' }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>I have read all instructions and I am ready to start the assessment.</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Link to="/candidate/assessments" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              onClick={handleStartAssessment}
              className="btn btn-primary"
              disabled={!agreed || starting}
              style={{ padding: '10px 24px', fontSize: '0.95rem' }}
            >
              <Play size={16} />
              <span>{starting ? 'Initiating...' : 'Start Assessment Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
