import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { title: 'Total Players', count: '-', link: '/players', icon: 'fas fa-users', color: 'primary', bg: 'primary-50' },
    { title: 'Teams Managed', count: '-', link: '/teams', icon: 'fas fa-shield-alt', color: 'success', bg: 'success-bg' },
    { title: 'Active Agents', count: '-', link: '/agents', icon: 'fas fa-user-tie', color: 'warning', bg: 'warning-bg' },
    { title: 'Active Loans', count: '-', link: '/loans', icon: 'fas fa-handshake', color: 'info', bg: 'primary-50' },
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
          { title: 'Total Players', count: getCount(playersRes), link: '/players', icon: 'fas fa-users', color: 'primary', bg: 'primary-50' },
          { title: 'Teams Managed', count: getCount(teamsRes), link: '/teams', icon: 'fas fa-shield-alt', color: 'success', bg: 'success-bg' },
          { title: 'Active Agents', count: getCount(agentsRes), link: '/agents', icon: 'fas fa-user-tie', color: 'warning', bg: 'warning-bg' },
          { title: 'Active Loans', count: getCount(loansRes), link: '/loans', icon: 'fas fa-handshake', color: 'info', bg: 'primary-50' },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 fade-in">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">Dashboard</h1>
          <p className="text-muted mb-0">Overview of your club's loan activities.</p>
        </div>
        <div className="mt-3 mt-md-0">
           <div className="d-flex align-items-center bg-white rounded-pill shadow-sm px-3 py-2 border">
             <div className="bg-primary-100 text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '32px', height: '32px'}}>
                <i className="far fa-calendar-alt small"></i>
             </div>
             <span className="text-secondary fw-medium small">
               {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </span>
           </div>
        </div>
      </div>

      <Row className="g-4 mb-5">
        {stats.map((stat, idx) => (
          <Col md={6} xl={3} key={idx} className="slide-up" style={{animationDelay: `${idx * 0.1}s`}}>
            <Card className="h-100 border-0 shadow-sm card-hover">
              <Card.Body className="d-flex align-items-center p-4">
                 <div className={`rounded-2xl p-3 me-3 d-flex align-items-center justify-content-center shadow-sm`}
                      style={{
                          width: '64px',
                          height: '64px',
                          flexShrink: 0,
                          backgroundColor: stat.color === 'primary' ? 'var(--primary-50)' : `var(--${stat.color}-bg, var(--slate-50))`,
                          color: stat.color === 'primary' ? 'var(--primary-600)' : `var(--${stat.color}-text, var(--slate-600))`
                      }}>
                    <i className={`${stat.icon} fa-lg`}></i>
                 </div>
                 <div>
                    <div className="text-muted small text-uppercase fw-bold mb-1 letter-spacing-wide">{stat.title}</div>
                    <div className="h2 fw-bold mb-0 text-dark tracking-tight">{stat.count}</div>
                 </div>
                 <Link to={stat.link} className="stretched-link"></Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4 slide-up" style={{animationDelay: '0.4s'}}>
        <Col lg={8}>
            <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-2">
                   <h5 className="mb-0 fw-bold">Quick Actions</h5>
                </Card.Header>
                <Card.Body className="p-4">
                    <Row className="g-3">
                        <Col sm={4}>
                           <Link to="/players/new" className="text-decoration-none">
                               <div className="p-4 border rounded-xl bg-slate-50 hover-lift hover-bg-white transition-all h-100 d-flex flex-column align-items-center text-center cursor-pointer group">
                                  <div className="mb-3 text-primary bg-white p-3 rounded-circle shadow-sm group-hover:scale-110 transition-transform">
                                      <i className="fas fa-user-plus fa-lg"></i>
                                  </div>
                                  <h6 className="fw-bold text-dark">Register Player</h6>
                                  <p className="small text-muted mb-0">Add new talent to roster</p>
                               </div>
                           </Link>
                        </Col>
                        <Col sm={4}>
                            <Link to="/loans/new" className="text-decoration-none">
                               <div className="p-4 border rounded-xl bg-slate-50 hover-lift hover-bg-white transition-all h-100 d-flex flex-column align-items-center text-center cursor-pointer group">
                                  <div className="mb-3 text-success bg-white p-3 rounded-circle shadow-sm group-hover:scale-110 transition-transform">
                                      <i className="fas fa-file-contract fa-lg"></i>
                                  </div>
                                  <h6 className="fw-bold text-dark">Initiate Loan</h6>
                                  <p className="small text-muted mb-0">Create new agreement</p>
                               </div>
                           </Link>
                        </Col>
                         <Col sm={4}>
                            <Link to="/agents/new" className="text-decoration-none">
                               <div className="p-4 border rounded-xl bg-slate-50 hover-lift hover-bg-white transition-all h-100 d-flex flex-column align-items-center text-center cursor-pointer group">
                                  <div className="mb-3 text-warning bg-white p-3 rounded-circle shadow-sm group-hover:scale-110 transition-transform">
                                      <i className="fas fa-user-tie fa-lg"></i>
                                  </div>
                                  <h6 className="fw-bold text-dark">Add Agent</h6>
                                  <p className="small text-muted mb-0">Register new contact</p>
                               </div>
                           </Link>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Col>
        <Col lg={4}>
            <Card className="border-0 shadow-sm h-100 bg-gradient-dark text-white overflow-hidden position-relative">
                {/* Decorative blob */}
                <div className="position-absolute top-0 end-0 translate-middle rounded-circle bg-primary opacity-25" style={{width: '200px', height: '200px', filter: 'blur(40px)'}}></div>

                <Card.Header className="bg-transparent border-0 pt-4 px-4 position-relative z-10">
                   <h5 className="mb-0 fw-bold text-white">Watchlist</h5>
                </Card.Header>
                <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center text-center position-relative z-10">
                    <div className="bg-white bg-opacity-10 rounded-circle p-4 mb-3 backdrop-blur-sm">
                        <i className="fas fa-star fa-2x text-warning"></i>
                    </div>
                    <h6 className="fw-bold text-white">Track Potential</h6>
                    <p className="text-white-50 small mb-4">Keep an eye on players for future loan opportunities.</p>
                    <Link to="/watchlist" className="w-100">
                        <button className="btn btn-light w-100 fw-bold text-primary">View Watchlist</button>
                    </Link>
                </Card.Body>
            </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
