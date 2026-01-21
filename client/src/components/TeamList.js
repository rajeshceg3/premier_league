import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Table, Button, Spinner, Card, Row, Col, Modal } from 'react-bootstrap';
import apiClient from '../services/apiClient';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
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

  const confirmDelete = (team) => {
    setTeamToDelete(team);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!teamToDelete) return;
    try {
      await apiClient.delete(`/teams/${teamToDelete._id}`);
      setTeams(teams.filter(team => team._id !== teamToDelete._id));
      toast.success('Team deleted successfully.');
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete team.');
    }
  };

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
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No teams found.</p>
              <Link to="/teams/new">
                <Button variant="outline-primary" size="sm">Create First Team</Button>
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
                            onClick={() => confirmDelete(team)}
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete team <strong>{teamToDelete?.name}</strong>?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={executeDelete}>
            Delete Team
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default TeamList;
