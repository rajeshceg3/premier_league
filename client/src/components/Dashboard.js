import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { title: 'Total Players', count: '-', link: '/players', icon: 'fas fa-users', color: 'primary' },
    { title: 'Teams Managed', count: '-', link: '/teams', icon: 'fas fa-shield-alt', color: 'success' },
    { title: 'Active Agents', count: '-', link: '/agents', icon: 'fas fa-briefcase', color: 'warning' },
    { title: 'Active Loans', count: '-', link: '/loans', icon: 'fas fa-handshake', color: 'info' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, teamsRes, agentsRes, loansRes] = await Promise.all([
          apiClient.get('/players'),
          apiClient.get('/teams'),
          apiClient.get('/agents'),
          apiClient.get('/loans')
        ]);

        // Handle pagination response structure or array
        const getCount = (res) => res.data.totalItems || res.data.length || 0;

        setStats([
          { title: 'Total Players', count: getCount(playersRes), link: '/players', icon: 'fas fa-users', color: 'primary' },
          { title: 'Teams Managed', count: getCount(teamsRes), link: '/teams', icon: 'fas fa-shield-alt', color: 'success' },
          { title: 'Active Agents', count: getCount(agentsRes), link: '/agents', icon: 'fas fa-user-tie', color: 'warning' },
          { title: 'Active Loans', count: getCount(loansRes), link: '/loans', icon: 'fas fa-handshake', color: 'info' },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="h3 fw-bold text-secondary mb-1">Dashboard</h1>
          <p className="text-muted mb-0">Welcome back, {user?.name || 'Manager'}</p>
        </div>
        <div>
           {/* Date or other utility could go here */}
           <span className="badge bg-white text-secondary shadow-sm p-2 border fw-normal">
             <i className="far fa-calendar-alt me-2"></i>
             {new Date().toLocaleDateString()}
           </span>
        </div>
      </div>

      <Row className="g-4 mb-5">
        {stats.map((stat, idx) => (
          <Col md={6} xl={3} key={idx}>
            <Card className="h-100 border-0 shadow-sm card-hover">
              <Card.Body className="d-flex align-items-center p-4">
                 <div className={`rounded-circle bg-${stat.color} bg-opacity-10 p-3 me-3 text-${stat.color} d-flex align-items-center justify-content-center`} style={{width: '60px', height: '60px', flexShrink: 0}}>
                    <i className={`${stat.icon} fa-lg`}></i>
                 </div>
                 <div>
                    <div className="text-muted small text-uppercase fw-bold mb-1">{stat.title}</div>
                    <div className="h3 fw-bold mb-0 text-dark">{stat.count}</div>
                 </div>
                 <Link to={stat.link} className="stretched-link"></Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={8}>
            <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                   <h5 className="mb-0 fw-bold">Quick Actions</h5>
                </Card.Header>
                <Card.Body className="p-4">
                    <Row className="g-3">
                        <Col sm={6}>
                           <div className="p-3 border rounded bg-light hover-bg-white transition-all h-100 d-flex flex-column">
                              <div className="mb-2 text-primary"><i className="fas fa-user-plus fa-2x"></i></div>
                              <h6 className="fw-bold">Register Player</h6>
                              <p className="small text-muted mb-3">Add a new player profile to the database.</p>
                              <Button variant="primary" size="sm" as={Link} to="/players/new" className="mt-auto stretched-link">Create Player</Button>
                           </div>
                        </Col>
                        <Col sm={6}>
                           <div className="p-3 border rounded bg-light hover-bg-white transition-all h-100 d-flex flex-column">
                              <div className="mb-2 text-success"><i className="fas fa-file-contract fa-2x"></i></div>
                              <h6 className="fw-bold">Initiate Loan</h6>
                              <p className="small text-muted mb-3">Start a new loan agreement process.</p>
                              <Button variant="success" size="sm" as={Link} to="/loans/new" className="mt-auto stretched-link">New Loan</Button>
                           </div>
                        </Col>
                         <Col sm={6}>
                           <div className="p-3 border rounded bg-light hover-bg-white transition-all h-100 d-flex flex-column">
                              <div className="mb-2 text-warning"><i className="fas fa-user-tie fa-2x"></i></div>
                              <h6 className="fw-bold">Add Agent</h6>
                              <p className="small text-muted mb-3">Register a new agent contact.</p>
                              <Button variant="warning" size="sm" as={Link} to="/agents/new" className="mt-auto stretched-link text-white">New Agent</Button>
                           </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Col>
        <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-transparent border-0 pt-4 px-4">
                   <h5 className="mb-0 fw-bold">Watchlist</h5>
                </Card.Header>
                <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center text-center">
                    <div className="bg-light rounded-circle p-4 mb-3">
                        <i className="fas fa-star fa-3x text-warning"></i>
                    </div>
                    <h6 className="fw-bold">Track Potential</h6>
                    <p className="text-muted small mb-4">Keep an eye on players for future loan opportunities.</p>
                    <Button variant="outline-dark" className="w-100" as={Link} to="/watchlist">View Watchlist</Button>
                </Card.Body>
            </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
