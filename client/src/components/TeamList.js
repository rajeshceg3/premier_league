import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Table, Button, Spinner, Card, Modal, InputGroup, Form } from 'react-bootstrap';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const TeamList = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/teams');
        setTeams(res.data);
        setFilteredTeams(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch teams.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const results = teams.filter(team =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.coach.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeams(results);
  }, [searchTerm, teams]);

  const confirmDelete = (team) => {
    setTeamToDelete(team);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!teamToDelete) return;
    try {
      await apiClient.delete(`/teams/${teamToDelete._id}`);
      const updatedTeams = teams.filter(team => team._id !== teamToDelete._id);
      setTeams(updatedTeams);
      setFilteredTeams(updatedTeams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      toast.success('Team deleted successfully.');
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete team.');
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <div>
           <h2 className="fw-bold text-secondary mb-1">Team Management</h2>
           <p className="text-muted mb-0">Manage football clubs and coaching staff.</p>
        </div>
        <div className="mt-3 mt-md-0">
            { user && (
                <Link to="/teams/new">
                    <Button variant="primary" className="shadow-sm">
                    <i className="fas fa-plus me-2"></i> Register Team
                    </Button>
                </Link>
            )}
        </div>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
             <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                    <i className="fas fa-search text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder="Search by team name or coach..."
                    className="border-start-0 ps-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3 text-muted"><i className="fas fa-shield-alt fa-3x"></i></div>
              <p className="text-muted">No teams found.</p>
              {searchTerm && <Button variant="link" onClick={() => setSearchTerm('')}>Clear Search</Button>}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 table-borderless">
                <thead className="bg-light text-secondary border-bottom">
                  <tr>
                    <th className="ps-4 py-3 text-uppercase small fw-bold">Team Name</th>
                    <th className="py-3 text-uppercase small fw-bold">Head Coach</th>
                    <th className="pe-4 py-3 text-uppercase small fw-bold text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map(team => (
                    <tr key={team._id} className="border-bottom">
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center">
                              <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                                  <i className="fas fa-shield-alt"></i>
                              </div>
                              <span className="fw-bold text-dark">{team.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted">
                        <i className="fas fa-user-tie me-2 text-secondary small"></i>
                        {team.coach}
                      </td>
                      <td className="pe-4 py-3 text-end">
                        { user && (
                            <div className="d-flex justify-content-end gap-2">
                                <Link to={`/teams/edit/${team._id}`}>
                                    <Button variant="light" size="sm" className="text-secondary hover-primary" title="Edit">
                                    <i className="fas fa-edit"></i>
                                    </Button>
                                </Link>

                                <Button
                                    variant="light"
                                    size="sm"
                                    className="text-danger hover-danger"
                                    onClick={() => confirmDelete(team)}
                                    title="Delete"
                                >
                                    <i className="fas fa-trash"></i>
                                </Button>
                            </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h5 fw-bold text-danger">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p>Are you sure you want to delete team <strong>{teamToDelete?.name}</strong>?</p>
          <p className="small text-muted mb-0">This action will remove the team and may affect associated loans.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={executeDelete}>
            <i className="fas fa-trash me-2"></i>Delete Team
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default TeamList;
