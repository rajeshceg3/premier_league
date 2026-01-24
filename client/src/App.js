import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navbar, Nav, Offcanvas } from 'react-bootstrap';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PlayerList from './components/PlayerList';
import PlayerForm from './components/PlayerForm';
import TeamList from './components/TeamList';
import TeamForm from './components/TeamForm';
import AgentList from './components/AgentList';
import AgentForm from './components/AgentForm';
import LoanList from './components/LoanList';
import LoanForm from './components/LoanForm';
import WatchlistPage from './components/WatchlistPage';
import Sidebar from './components/Sidebar';
import './App.css';

// Component to handle layout logic (Sidebar vs Auth pages)
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (isAuthPage || !user) {
    return <div className="auth-container">{children}</div>;
  }

  return (
    <div className="app-shell">
      {/* Desktop Sidebar - hidden on mobile via CSS media queries */}
      <div className="d-none d-lg-block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="content-wrapper">
        {/* Mobile Navbar - visible only on mobile */}
        <Navbar expand={false} className="d-lg-none glass-panel sticky-top px-3 py-2 border-0 rounded-0">
          <Navbar.Brand as={NavLink} to="/" className="fw-bold font-montserrat text-dark d-flex align-items-center gap-2">
             <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{width: '32px', height: '32px'}}>
                <i className="fas fa-futbol small"></i>
             </div>
             <span className="text-secondary">PL Loans</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="mobile-menu" onClick={() => setShowMobileMenu(true)} className="border-0 p-1 text-primary">
             <i className="fas fa-bars fa-lg"></i>
          </Navbar.Toggle>

          <Navbar.Offcanvas
            id="mobile-menu"
            aria-labelledby="mobile-menu-label"
            placement="end"
            show={showMobileMenu}
            onHide={() => setShowMobileMenu(false)}
            className="mobile-offcanvas"
          >
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title id="mobile-menu-label" className="font-montserrat fw-bold d-flex align-items-center gap-2">
                 <i className="fas fa-futbol text-primary"></i> PL Loans
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
               <div className="d-flex flex-column h-100">
                   <Nav className="flex-column p-3">
                      <Nav.Link as={NavLink} to="/dashboard" onClick={() => setShowMobileMenu(false)} className="sidebar-link">
                        <i className="fas fa-chart-line"></i>
                        <span className="ms-3">Dashboard</span>
                      </Nav.Link>

                      <div className="sidebar-heading mt-3">Entities</div>

                      <Nav.Link as={NavLink} to="/players" onClick={() => setShowMobileMenu(false)} className="sidebar-link">
                        <i className="fas fa-users"></i>
                        <span className="ms-3">Players</span>
                      </Nav.Link>
                      <Nav.Link as={NavLink} to="/teams" onClick={() => setShowMobileMenu(false)} className="sidebar-link">
                        <i className="fas fa-shield-alt"></i>
                        <span className="ms-3">Teams</span>
                      </Nav.Link>
                      <Nav.Link as={NavLink} to="/agents" onClick={() => setShowMobileMenu(false)} className="sidebar-link">
                        <i className="fas fa-user-tie"></i>
                        <span className="ms-3">Agents</span>
                      </Nav.Link>
                      <Nav.Link as={NavLink} to="/loans" onClick={() => setShowMobileMenu(false)} className="sidebar-link">
                        <i className="fas fa-handshake"></i>
                        <span className="ms-3">Loans</span>
                      </Nav.Link>

                      <div className="sidebar-heading mt-3">Tools</div>

                      <Nav.Link as={NavLink} to="/watchlist" onClick={() => setShowMobileMenu(false)} className="sidebar-link">
                        <i className="fas fa-star"></i>
                        <span className="ms-3">Watchlist</span>
                      </Nav.Link>
                   </Nav>

                   <div className="mt-auto p-3 border-top border-secondary border-opacity-25">
                      <div className="d-flex align-items-center gap-3 text-white-50">
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm text-white" style={{width: '40px', height: '40px'}}>
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <div className="fw-bold text-white">{user?.name || 'Admin User'}</div>
                          <button onClick={() => { setShowMobileMenu(false); logout(); }} className="btn btn-link p-0 text-danger text-decoration-none small">
                            Sign Out
                          </button>
                        </div>
                      </div>
                   </div>
               </div>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Navbar>

        {/* Page Content */}
        <div className="p-3 p-lg-4 p-xl-5 fade-in">
           {children}
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
          <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
  }

  return (
      <>
        <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />

        <Layout>
          <Routes>
            <Route path="/login" element={!user ? <LoginForm /> : <Navigate to="/loans" />} />
            <Route path="/register" element={!user ? <RegistrationForm /> : <Navigate to="/loans" />} />

            <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            <Route path="/players" element={<PlayerList />} />
            <Route path="/players/new" element={<ProtectedRoute><PlayerForm /></ProtectedRoute>} />
            <Route path="/players/edit/:id" element={<ProtectedRoute><PlayerForm /></ProtectedRoute>} />

            <Route path="/teams" element={<TeamList />} />
            <Route path="/teams/new" element={<ProtectedRoute><TeamForm /></ProtectedRoute>} />
            <Route path="/teams/edit/:id" element={<ProtectedRoute><TeamForm /></ProtectedRoute>} />

            <Route path="/agents" element={<AgentList />} />
            <Route path="/agents/new" element={<ProtectedRoute><AgentForm /></ProtectedRoute>} />
            <Route path="/agents/edit/:id" element={<ProtectedRoute><AgentForm /></ProtectedRoute>} />

            <Route path="/loans" element={<LoanList />} />
            <Route path="/loans/new" element={<ProtectedRoute><LoanForm /></ProtectedRoute>} />
            <Route path="/loans/edit/:id" element={<ProtectedRoute><LoanForm /></ProtectedRoute>} />

            <Route path="/" element={<Navigate to="/loans" />} />
          </Routes>
        </Layout>
      </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
