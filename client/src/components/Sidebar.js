import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css'; // We'll create this or put it in App.css

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="sidebar d-flex flex-column p-3 text-white">
      <div className="sidebar-brand mb-4 d-flex align-items-center">
        <div className="brand-icon me-2">
          <i className="fas fa-futbol fa-lg text-primary"></i>
        </div>
        <span className="fs-5 fw-bold font-montserrat">PL Loans</span>
      </div>

      <Nav className="flex-column mb-auto">
        <Nav.Link as={NavLink} to="/dashboard" className="sidebar-link mb-2">
          <i className="fas fa-chart-line me-3"></i>
          Dashboard
        </Nav.Link>
        <div className="sidebar-heading text-uppercase mt-3 mb-2">Entities</div>
        <Nav.Link as={NavLink} to="/players" className="sidebar-link mb-2">
          <i className="fas fa-users me-3"></i>
          Players
        </Nav.Link>
        <Nav.Link as={NavLink} to="/teams" className="sidebar-link mb-2">
          <i className="fas fa-shield-alt me-3"></i>
          Teams
        </Nav.Link>
        <Nav.Link as={NavLink} to="/agents" className="sidebar-link mb-2">
          <i className="fas fa-user-tie me-3"></i>
          Agents
        </Nav.Link>
        <Nav.Link as={NavLink} to="/loans" className="sidebar-link mb-2">
          <i className="fas fa-handshake me-3"></i>
          Loans
        </Nav.Link>
        <div className="sidebar-heading text-uppercase mt-3 mb-2">Tools</div>
        <Nav.Link as={NavLink} to="/watchlist" className="sidebar-link mb-2">
          <i className="fas fa-star me-3"></i>
          Watchlist
        </Nav.Link>
      </Nav>

      <hr className="text-secondary" />

      <div className="user-profile d-flex align-items-center p-2 mb-2 rounded hover-bg-dark">
        <div className="avatar me-2 bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
          <i className="fas fa-user text-white small"></i>
        </div>
        <div className="flex-grow-1 overflow-hidden">
          <div className="small fw-bold text-truncate">Admin User</div>
        </div>
        <button onClick={logout} className="btn btn-link text-muted p-0 ms-2" title="Logout">
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
