import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { title: 'Players', count: '-', link: '/players', icon: 'fas fa-users', color: 'primary' },
    { title: 'Teams', count: '-', link: '/teams', icon: 'fas fa-shield-alt', color: 'success' },
    { title: 'Agents', count: '-', link: '/agents', icon: 'fas fa-briefcase', color: 'warning' },
    { title: 'Loans', count: '-', link: '/loans', icon: 'fas fa-handshake', color: 'info' },
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

        setStats([
          { title: 'Players', count: playersRes.data.length, link: '/players', icon: 'fas fa-users', color: 'primary' },
          { title: 'Teams', count: teamsRes.data.length, link: '/teams', icon: 'fas fa-shield-alt', color: 'success' },
          { title: 'Agents', count: agentsRes.data.length, link: '/agents', icon: 'fas fa-briefcase', color: 'warning' },
          { title: 'Loans', count: loansRes.data.length, link: '/loans', icon: 'fas fa-handshake', color: 'info' },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
        // Optionally handle error state
      }
    };

    fetchData();
  }, []);

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Dashboard</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
           <span className="text-muted">Welcome back, {user && user.name ? user.name : 'User'}</span>
        </div>
      </div>

      <Row xs={1} md={2} lg={4} className="g-4 mb-4">
        {stats.map((stat, idx) => (
          <Col key={idx}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                 <div className={`rounded-circle bg-${stat.color} bg-opacity-10 p-3 mb-3 text-${stat.color}`} style={{width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <i className={`${stat.icon} fa-2x`}></i>
                 </div>
                <Card.Title>{stat.title}</Card.Title>
                <Card.Text className="display-6 fw-bold">{stat.count}</Card.Text>
                <Link to={stat.link} className="stretched-link"></Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col md={6}>
            <Card className="shadow-sm h-100">
                <Card.Header>Quick Actions</Card.Header>
                <Card.Body>
                    <div className="d-grid gap-2">
                        <Button variant="outline-primary" as={Link} to="/players/new">
                            <i className="fas fa-plus me-2"></i> Register New Player
                        </Button>
                        <Button variant="outline-success" as={Link} to="/loans/new">
                            <i className="fas fa-file-contract me-2"></i> Initiate Loan
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        <Col md={6}>
            <Card className="shadow-sm h-100">
                <Card.Header>Watchlist Preview</Card.Header>
                <Card.Body>
                    <div className="text-center my-4">
                        <i className="fas fa-list-alt fa-3x mb-3 text-muted"></i>
                        <p className="text-muted">Quickly access your tracked players.</p>
                    </div>
                    <div className="d-grid">
                        <Button variant="outline-secondary" as={Link} to="/watchlist">Go to Watchlist</Button>
                    </div>
                </Card.Body>
            </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
