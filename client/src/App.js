import React from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from 'react-router-dom'; // Changed Link to NavLink
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
import LoanList from './components/LoanList'; // Import LoanList
import LoanForm from './components/LoanForm'; // Import LoanForm
import WatchlistPage from './components/WatchlistPage'; // Import WatchlistPage
import './App.css';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <div className="App"> {/* Added className App for potential top-level app styling */}
        <nav>
          <div className="app-logo">AppLogo</div> {/* Placeholder for logo/title */}
          <ul>
            <li>
              <NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>
                <i className="fas fa-sign-in-alt"></i> Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className={({ isActive }) => isActive ? "active" : ""}>
                <i className="fas fa-user-plus"></i> Register
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
                <i className="fas fa-tachometer-alt"></i> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/players" className={({ isActive }) => isActive ? "active" : ""}>
                <i className="fas fa-users"></i> Players
              </NavLink>
            </li>
            <li>
              <NavLink to="/teams" className={({ isActive }) => isActive ? "active" : ""}>
                <i className="fas fa-shield-alt"></i> Teams
              </NavLink>
            </li>
            <li>
              <NavLink to="/agents" className={({ isActive }) => isActive ? "active" : ""}>
                <i className="fas fa-briefcase"></i> Agents
              </NavLink>
            </li>
            <li>
              <NavLink to="/loans" className={({ isActive }) => isActive ? "active" : ""}>
                <i className="fas fa-handshake"></i> Loans
              </NavLink>
            </li>
            <li>
              <NavLink to="/watchlist" className={({ isActive }) => isActive ? "active" : ""}>
                <i className="fas fa-list-alt"></i> My Watchlist
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="main-content"> {/* Wrapper for content below nav */}
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
          {/* Player Management Routes */}
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
          {/* Team Management Routes */}
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
          {/* Agent Management Routes */}
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
          {/* Loan Management Routes */}
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
            {/* Redirect to dashboard if logged in, otherwise to login */}
            <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          </Routes>
        </div> {/* End of main-content */}
      </div> {/* End of App */}
    </Router>
  );
}

export default App;
