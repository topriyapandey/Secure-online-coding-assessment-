import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Code, 
  History, 
  LogOut,
  Terminal 
} from 'lucide-react';

export const CandidateLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Terminal size={24} color="#38bdf8" />
          <div>
            <div className="sidebar-brand">CodeEvaluator</div>
            <span className="sidebar-badge" style={{ backgroundColor: '#0284c7' }}>Candidate</span>
          </div>
        </div>

        <ul className="sidebar-nav">
          <li>
            <NavLink to="/candidate" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/candidate/assessments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Code size={18} />
              <span>Available Assessments</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/candidate/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <History size={18} />
              <span>Assessment History</span>
            </NavLink>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar" style={{ backgroundColor: '#0284c7' }}>
              {user?.fullName?.charAt(0) || 'C'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.fullName || 'Candidate'}</div>
              <div className="user-role">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <Outlet />
      </div>
    </div>
  );
};
