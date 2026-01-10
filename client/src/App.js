import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from 'react-router-dom';
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
import './App.css';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
  }

  return (
      <div className="App">
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

        <Navbar bg="dark" variant="dark" expand="lg" expanded={expanded} onToggle={setExpanded}>
          <Container fluid>
            <Navbar.Brand as={NavLink} to="/" onClick={() => setExpanded(false)}>Premier League Loans</Navbar.Brand>
            <Navbar.Toggle aria-controls="offcanvasNavbar" />
            <Navbar.Offcanvas
              id="offcanvasNavbar"
              aria-labelledby="offcanvasNavbarLabel"
              placement="end"
            >
              <Offcanvas.Header closeButton onClick={() => setExpanded(false)}>
                <Offcanvas.Title id="offcanvasNavbarLabel">Menu</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="justify-content-end flex-grow-1 pe-3">
                  {!user && (
                    <>
                      <Nav.Link as={NavLink} to="/login" onClick={() => setExpanded(false)}><i className="fas fa-sign-in-alt"></i> Login</Nav.Link>
                      <Nav.Link as={NavLink} to="/register" onClick={() => setExpanded(false)}><i className="fas fa-user-plus"></i> Register</Nav.Link>
                    </>
                  )}
                  {user && (
                    <>
                      <Nav.Link as={NavLink} to="/dashboard" onClick={() => setExpanded(false)}><i className="fas fa-tachometer-alt"></i> Dashboard</Nav.Link>
                      <Nav.Link as={NavLink} to="/players" onClick={() => setExpanded(false)}><i className="fas fa-users"></i> Players</Nav.Link>
                      <Nav.Link as={NavLink} to="/teams" onClick={() => setExpanded(false)}><i className="fas fa-shield-alt"></i> Teams</Nav.Link>
                      <Nav.Link as={NavLink} to="/agents" onClick={() => setExpanded(false)}><i className="fas fa-briefcase"></i> Agents</Nav.Link>
                      <Nav.Link as={NavLink} to="/loans" onClick={() => setExpanded(false)}><i className="fas fa-handshake"></i> Loans</Nav.Link>
                      <Nav.Link as={NavLink} to="/watchlist" onClick={() => setExpanded(false)}><i className="fas fa-list-alt"></i> Watchlist</Nav.Link>
                      <Nav.Link onClick={() => { logout(); setExpanded(false); }} style={{cursor: 'pointer'}}><i className="fas fa-sign-out-alt"></i> Logout</Nav.Link>
                    </>
                  )}
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>

        <Container className="mt-4">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route
              path="/watchlist"
              element={
                <ProtectedRoute>
                  <WatchlistPage />
                </ProtectedRoute>
              }
            />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/players"
            element={
              <ProtectedRoute>
                <PlayerList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/players/new"
            element={
              <ProtectedRoute>
                <PlayerForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/players/edit/:id"
            element={
              <ProtectedRoute>
                <PlayerForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <TeamList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/new"
            element={
              <ProtectedRoute>
                <TeamForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/edit/:id"
            element={
              <ProtectedRoute>
                <TeamForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agents"
            element={
              <ProtectedRoute>
                <AgentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agents/new"
            element={
              <ProtectedRoute>
                <AgentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agents/edit/:id"
            element={
              <ProtectedRoute>
                <AgentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans"
            element={
              <ProtectedRoute>
                <LoanList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans/new"
            element={
              <ProtectedRoute>
                <LoanForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans/edit/:id"
            element={
              <ProtectedRoute>
                <LoanForm />
              </ProtectedRoute>
            }
          />
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          </Routes>
        </Container>
      </div>
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
