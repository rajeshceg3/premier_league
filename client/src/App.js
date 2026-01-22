import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navbar, Nav, Container, Offcanvas } from 'react-bootstrap';
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
  const { user } = useAuth();
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
        <Navbar expand={false} className="d-lg-none bg-white border-bottom px-3 py-2 shadow-sm sticky-top">
          <Navbar.Brand as={NavLink} to="/" className="fw-bold font-montserrat text-dark">
            PL Loans
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="mobile-menu" onClick={() => setShowMobileMenu(true)} className="border-0">
             <i className="fas fa-bars text-primary fs-4"></i>
          </Navbar.Toggle>

          <Navbar.Offcanvas
            id="mobile-menu"
            aria-labelledby="mobile-menu-label"
            placement="end"
            show={showMobileMenu}
            onHide={() => setShowMobileMenu(false)}
            className="bg-dark text-white"
          >
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title id="mobile-menu-label" className="font-montserrat fw-bold">Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
               {/* Reuse Sidebar links logic or Component here if needed, or just manual links */}
               <Nav className="flex-column">
                  <Nav.Link as={NavLink} to="/dashboard" onClick={() => setShowMobileMenu(false)} className="text-white py-3 border-bottom border-secondary">
                    <i className="fas fa-chart-line me-3"></i> Dashboard
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/players" onClick={() => setShowMobileMenu(false)} className="text-white py-3 border-bottom border-secondary">
                    <i className="fas fa-users me-3"></i> Players
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/teams" onClick={() => setShowMobileMenu(false)} className="text-white py-3 border-bottom border-secondary">
                    <i className="fas fa-shield-alt me-3"></i> Teams
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/agents" onClick={() => setShowMobileMenu(false)} className="text-white py-3 border-bottom border-secondary">
                    <i className="fas fa-user-tie me-3"></i> Agents
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/loans" onClick={() => setShowMobileMenu(false)} className="text-white py-3 border-bottom border-secondary">
                    <i className="fas fa-handshake me-3"></i> Loans
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/watchlist" onClick={() => setShowMobileMenu(false)} className="text-white py-3 border-bottom border-secondary">
                    <i className="fas fa-star me-3"></i> Watchlist
                  </Nav.Link>
               </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Navbar>

        {/* Page Content */}
        <div className="p-3 p-lg-4 p-xl-5">
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
            <Route path="/login" element={!user ? <LoginForm /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <RegistrationForm /> : <Navigate to="/dashboard" />} />

            <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            <Route path="/players" element={<ProtectedRoute><PlayerList /></ProtectedRoute>} />
            <Route path="/players/new" element={<ProtectedRoute><PlayerForm /></ProtectedRoute>} />
            <Route path="/players/edit/:id" element={<ProtectedRoute><PlayerForm /></ProtectedRoute>} />

            <Route path="/teams" element={<ProtectedRoute><TeamList /></ProtectedRoute>} />
            <Route path="/teams/new" element={<ProtectedRoute><TeamForm /></ProtectedRoute>} />
            <Route path="/teams/edit/:id" element={<ProtectedRoute><TeamForm /></ProtectedRoute>} />

            <Route path="/agents" element={<ProtectedRoute><AgentList /></ProtectedRoute>} />
            <Route path="/agents/new" element={<ProtectedRoute><AgentForm /></ProtectedRoute>} />
            <Route path="/agents/edit/:id" element={<ProtectedRoute><AgentForm /></ProtectedRoute>} />

            <Route path="/loans" element={<ProtectedRoute><LoanList /></ProtectedRoute>} />
            <Route path="/loans/new" element={<ProtectedRoute><LoanForm /></ProtectedRoute>} />
            <Route path="/loans/edit/:id" element={<ProtectedRoute><LoanForm /></ProtectedRoute>} />

            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
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
