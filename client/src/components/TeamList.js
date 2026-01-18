import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';
import { Container, Table, Button, Spinner, Card, Row, Col } from 'react-bootstrap';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await apiClient.get('/teams');
        setTeams(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch teams.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await apiClient.delete(`/teams/${id}`);
        setTeams(teams.filter(team => team._id !== id));
        toast.success('Team deleted successfully.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete team.');
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
          <h2>Team Management</h2>
        </Col>
        <Col className="text-end">
           <Link to="/teams/new">
             <Button variant="primary">
               <i className="fas fa-plus"></i> Add New Team
             </Button>
           </Link>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          {teams.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No teams found.</p>
              <Link to="/teams/new">
                <Button variant="outline-primary" size="sm">Register First Team</Button>
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover striped bordered className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Coach</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map(team => (
                    <tr key={team._id}>
                      <td className="fw-bold">{team.name}</td>
                      <td>{team.coach}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link to={`/teams/edit/${team._id}`}>
                            <Button variant="outline-primary" size="sm" title="Edit">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </Link>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(team._id)}
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

export default TeamList;
