import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';
import { Container, Table, Button, Spinner, Badge, Card, Row, Col } from 'react-bootstrap';

const LoanList = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedData, setRelatedData] = useState({
    players: {},
    teams: {},
    agents: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch loans, players, teams, and agents in parallel
        // apiClient automatically attaches the x-auth-token via interceptors
        const [loansRes, playersRes, teamsRes, agentsRes] = await Promise.all([
          apiClient.get('/loans'),
          apiClient.get('/players'),
          apiClient.get('/teams'),
          apiClient.get('/agents'),
        ]);

        setLoans(loansRes.data);

        // Create lookups for related data
        const playersMap = playersRes.data.reduce((acc, player) => {
          acc[player._id] = player.name;
          return acc;
        }, {});
        const teamsMap = teamsRes.data.reduce((acc, team) => {
          acc[team._id] = team.name;
          return acc;
        }, {});
        const agentsMap = agentsRes.data.reduce((acc, agent) => {
          acc[agent._id] = agent.name;
          return acc;
        }, {});

        setRelatedData({ players: playersMap, teams: teamsMap, agents: agentsMap });
      } catch (err) {
        console.error("Error fetching loan data", err);
        toast.error(err.response?.data?.message || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        await apiClient.delete(`/loans/${id}`);
        setLoans(loans.filter(loan => loan._id !== id));
        toast.success('Loan deleted successfully.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete loan.');
      }
    }
  };

  const handleMarkAsReturned = async (loanId) => {
    if (window.confirm('Are you sure you want to mark this loan as returned?')) {
      try {
        const res = await apiClient.post(`/returns/${loanId}/return`);

        // Update the local state
        setLoans(loans.map(loan =>
          loan._id === loanId
            ? { ...loan, status: 'Returned', returnedDate: res.data.returnedDate || new Date().toISOString() }
            : loan
        ));
        toast.success('Loan marked as returned.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to mark loan as returned.');
      }
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>Loan Management</h2>
        </Col>
        <Col className="text-end">
           <Link to="/loans/new">
             <Button variant="primary">
               <i className="fas fa-plus"></i> Add New Loan
             </Button>
           </Link>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          {loans.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No loans found on file.</p>
              <Link to="/loans/new">
                <Button variant="outline-primary" size="sm">Create First Loan</Button>
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover striped bordered className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Player</th>
                    <th>From (Loaning)</th>
                    <th>To (Borrowing)</th>
                    <th>Agent</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map(loan => (
                    <tr key={loan._id}>
                      <td className="fw-bold">{relatedData.players[loan.player] || 'Unknown Player'}</td>
                      <td>{relatedData.teams[loan.loaningTeam] || 'Unknown Team'}</td>
                      <td>{relatedData.teams[loan.borrowingTeam] || 'Unknown Team'}</td>
                      <td>{relatedData.agents[loan.agent] || <span className="text-muted">None</span>}</td>
                      <td>
                        <div className="small">
                          <div><span className="text-muted">Start:</span> {new Date(loan.startDate).toLocaleDateString()}</div>
                          <div><span className="text-muted">End:</span> {new Date(loan.endDate).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td>
                        {loan.status === 'Returned' ? (
                          <Badge bg="secondary">Returned</Badge>
                        ) : (
                          <Badge bg="success">Active</Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link to={`/loans/edit/${loan._id}`}>
                            <Button variant="outline-primary" size="sm" title="Edit">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </Link>

                          {loan.status !== 'Returned' && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleMarkAsReturned(loan._id)}
                              title="Mark as Returned"
                            >
                              <i className="fas fa-undo"></i>
                            </Button>
                          )}

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(loan._id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoanList;
