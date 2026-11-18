import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  PlusCircle, 
  Users, 
  FileCode2, 
  Trophy, 
  LogOut,
  ShieldCheck 
} from 'lucide-react';

export const AdminLayout = () => {
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
          <ShieldCheck size={26} color="#3b82f6" />
          <div>
            <div className="sidebar-brand">Assessment Portal</div>
            <span className="sidebar-badge">Admin</span>
          </div>
        </div>

        <ul className="sidebar-nav">
          <li>
            <NavLink to="/admin" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/assessments" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FolderKanban size={18} />
              <span>Manage Assessments</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/assessments/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <PlusCircle size={18} />
              <span>Create Assessment</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/candidates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>Candidates</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/submissions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileCode2 size={18} />
              <span>Submissions</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/results" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Trophy size={18} />
              <span>Results & Rankings</span>
            </NavLink>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{user?.fullName?.charAt(0) || 'A'}</div>
            <div className="user-info">
              <div className="user-name">{user?.fullName || 'Administrator'}</div>
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
