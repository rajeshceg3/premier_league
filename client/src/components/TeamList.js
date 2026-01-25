import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Table, Button, Spinner, Card, Modal, InputGroup, Form, Row, Col } from 'react-bootstrap';
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

      <Card className="border-0 shadow-sm mb-4 glass-panel">
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

      {loading ? (
        <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
      ) : filteredTeams.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
                <div className="mb-3 text-muted opacity-50"><i className="fas fa-shield-alt fa-4x"></i></div>
                <h5 className="fw-bold text-dark">No Teams Found</h5>
                <p className="text-muted">No teams match your search criteria.</p>
                {searchTerm && <Button variant="link" onClick={() => setSearchTerm('')}>Clear Search</Button>}
            </Card.Body>
        </Card>
      ) : (
        <>
            {/* Desktop View */}
            <div className="d-none d-md-block">
                <Card className="border-0 shadow-sm overflow-hidden">
                    <Table hover className="align-middle mb-0 table-borderless">
                        <thead className="bg-light text-secondary border-bottom">
                        <tr>
                            <th className="ps-4 py-3 text-uppercase small fw-bold tracking-wide">Team Name</th>
                            <th className="py-3 text-uppercase small fw-bold tracking-wide">Head Coach</th>
                            <th className="pe-4 py-3 text-uppercase small fw-bold tracking-wide text-end">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredTeams.map(team => (
                            <tr key={team._id} className="border-bottom hover-bg-slate-50 transition-colors">
                            <td className="ps-4 py-3">
                                <div className="d-flex align-items-center">
                                    <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{width: '40px', height: '40px'}}>
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
                                    <div className="d-flex justify-content-end gap-2 opacity-75 hover-opacity-100">
                                        <Link to={`/teams/edit/${team._id}`}>
                                            <Button variant="light" size="sm" className="btn-icon rounded-circle shadow-sm" title="Edit">
                                            <i className="fas fa-pencil-alt text-secondary"></i>
                                            </Button>
                                        </Link>

                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="btn-icon rounded-circle shadow-sm"
                                            onClick={() => confirmDelete(team)}
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash-alt text-danger"></i>
                                        </Button>
                                    </div>
                                )}
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Card>
            </div>

            {/* Mobile View */}
            <div className="d-md-none">
                <Row className="g-3">
                    {filteredTeams.map(team => (
                        <Col xs={12} key={team._id}>
                            <Card className="border-0 shadow-sm rounded-xl overflow-hidden card-hover">
                                <Card.Body className="p-4">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{width: '48px', height: '48px'}}>
                                            <i className="fas fa-shield-alt fa-lg"></i>
                                        </div>
                                        <div className="fw-bold text-dark fs-5">{team.name}</div>
                                    </div>

                                    <div className="bg-slate-50 rounded p-3 mb-3">
                                        <div className="small text-muted text-uppercase fw-bold mb-1">Head Coach</div>
                                        <div className="text-dark fw-medium"><i className="fas fa-user-tie me-2 text-secondary"></i>{team.coach}</div>
                                    </div>

                                    { user && (
                                        <div className="d-grid gap-2 d-flex justify-content-end">
                                            <Link to={`/teams/edit/${team._id}`} className="flex-grow-1">
                                                <Button variant="light" className="w-100 border">Edit</Button>
                                            </Link>
                                            <Button variant="outline-danger" className="flex-grow-0" onClick={() => confirmDelete(team)}>
                                                <i className="fas fa-trash-alt"></i>
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </>
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static" contentClassName="border-0 shadow-lg rounded-2xl">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h5 fw-bold text-danger">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p>Are you sure you want to delete team <strong>{teamToDelete?.name}</strong>?</p>
          <p className="small text-muted mb-0">This action will remove the team and may affect associated loans.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-3 pe-4">
          <Button variant="light" onClick={() => setShowDeleteModal(false)} className="rounded-pill px-4">
            Cancel
          </Button>
          <Button variant="danger" onClick={executeDelete} className="rounded-pill px-4 shadow-sm">
            <i className="fas fa-trash me-2"></i>Delete Team
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default TeamList;
