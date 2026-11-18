import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';
import { CandidateLayout } from './layouts/CandidateLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AssessmentsList } from './pages/admin/AssessmentsList';
import { AssessmentForm } from './pages/admin/AssessmentForm';
import { QuestionsList } from './pages/admin/QuestionsList';
import { QuestionForm } from './pages/admin/QuestionForm';
import { CandidatesList } from './pages/admin/CandidatesList';
import { SubmissionsList } from './pages/admin/SubmissionsList';
import { ResultsLeaderboard } from './pages/admin/ResultsLeaderboard';

// Candidate Pages
import { CandidateDashboard } from './pages/candidate/Dashboard';
import { AvailableAssessments } from './pages/candidate/AvailableAssessments';
import { AssessmentInstructions } from './pages/candidate/AssessmentInstructions';
import { CodingEnvironment } from './pages/candidate/CodingEnvironment';
import { SubmissionResults } from './pages/candidate/SubmissionResults';
import { AssessmentHistory } from './pages/candidate/AssessmentHistory';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'Administrator' ? '/admin' : '/candidate'} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Root & Auth */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="Administrator">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="assessments" element={<AssessmentsList />} />
            <Route path="assessments/new" element={<AssessmentForm />} />
            <Route path="assessments/:id/edit" element={<AssessmentForm />} />
            <Route path="assessments/:assessmentId/questions" element={<QuestionsList />} />
            <Route path="assessments/:assessmentId/questions/new" element={<QuestionForm />} />
            <Route path="assessments/:assessmentId/questions/:questionId/edit" element={<QuestionForm />} />
            <Route path="candidates" element={<CandidatesList />} />
            <Route path="submissions" element={<SubmissionsList />} />
            <Route path="results" element={<ResultsLeaderboard />} />
          </Route>

          {/* Candidate Routes */}
          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRole="Candidate">
                <CandidateLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CandidateDashboard />} />
            <Route path="assessments" element={<AvailableAssessments />} />
            <Route path="assessments/:assessmentId/instructions" element={<AssessmentInstructions />} />
            <Route path="results/:attemptId" element={<SubmissionResults />} />
            <Route path="history" element={<AssessmentHistory />} />
          </Route>

          {/* Coding Assessment Interface (Candidate standalone distraction-free layout) */}
          <Route
            path="/candidate/attempt/:attemptId"
            element={
              <ProtectedRoute allowedRole="Candidate">
                <CodingEnvironment />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
