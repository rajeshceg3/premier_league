import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const { user } = useAuth(); // Assuming user object has name/email

  return (
    <div className="sidebar">
      <div className="sidebar-brand d-flex align-items-center gap-3">
        <div className="brand-icon">
          <i className="fas fa-futbol fa-lg"></i>
        </div>
        <span className="fs-5 fw-bold font-montserrat tracking-wide text-white">PL Loans</span>
      </div>

      <Nav className="flex-column mb-auto pt-2">
        <Nav.Link as={NavLink} to="/dashboard" className="sidebar-link">
          <i className="fas fa-chart-line"></i>
          <span className="ms-3">Dashboard</span>
        </Nav.Link>

        <div className="sidebar-heading">Entities</div>

        <Nav.Link as={NavLink} to="/players" className="sidebar-link">
          <i className="fas fa-users"></i>
          <span className="ms-3">Players</span>
        </Nav.Link>
        <Nav.Link as={NavLink} to="/teams" className="sidebar-link">
          <i className="fas fa-shield-alt"></i>
          <span className="ms-3">Teams</span>
        </Nav.Link>
        <Nav.Link as={NavLink} to="/agents" className="sidebar-link">
          <i className="fas fa-user-tie"></i>
          <span className="ms-3">Agents</span>
        </Nav.Link>
        <Nav.Link as={NavLink} to="/loans" className="sidebar-link">
          <i className="fas fa-handshake"></i>
          <span className="ms-3">Loans</span>
        </Nav.Link>

        <div className="sidebar-heading">Tools</div>

        <Nav.Link as={NavLink} to="/watchlist" className="sidebar-link">
          <i className="fas fa-star"></i>
          <span className="ms-3">Watchlist</span>
        </Nav.Link>
      </Nav>

      <div className="mt-auto">
        <div className="user-profile d-flex align-items-center gap-3 cursor-pointer">
          <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm text-white" style={{width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'}}>
            <span className="fw-bold small">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </span>
          </div>
          <div className="flex-grow-1 overflow-hidden">
            <div className="small fw-bold text-white text-truncate">{user?.name || 'Admin User'}</div>
            <div className="small text-muted text-truncate" style={{fontSize: '0.75rem'}}>View Profile</div>
          </div>
          <button onClick={logout} className="btn btn-link text-secondary p-0 hover-text-white transition-colors" title="Logout">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
