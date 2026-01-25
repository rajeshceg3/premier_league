import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Table, Button, Spinner, Card, Modal, InputGroup, Form, Row, Col } from 'react-bootstrap';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const AgentList = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/agents');
        setAgents(res.data);
        setFilteredAgents(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch agents.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    const results = agents.filter(agent =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgents(results);
  }, [searchTerm, agents]);

  const confirmDelete = (agent) => {
    setAgentToDelete(agent);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!agentToDelete) return;
    try {
      await apiClient.delete(`/agents/${agentToDelete._id}`);
      const updatedAgents = agents.filter(agent => agent._id !== agentToDelete._id);
      setAgents(updatedAgents);
      setFilteredAgents(updatedAgents.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      toast.success('Agent deleted successfully.');
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete agent.');
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <div>
           <h2 className="fw-bold text-secondary mb-1">Agent Management</h2>
           <p className="text-muted mb-0">Manage registered agents and their contact details.</p>
        </div>
        <div className="mt-3 mt-md-0">
            { user && (
                <Link to="/agents/new">
                    <Button variant="warning" className="shadow-sm text-white">
                    <i className="fas fa-plus me-2"></i> Register Agent
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
                    placeholder="Search agents by name or email..."
                    className="border-start-0 ps-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" role="status" variant="warning">
            <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
      ) : filteredAgents.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
                <div className="mb-3 text-muted opacity-50"><i className="fas fa-user-tie fa-4x"></i></div>
                <h5 className="fw-bold text-dark">No Agents Found</h5>
                <p className="text-muted">No agents match your search criteria.</p>
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
                            <th className="ps-4 py-3 text-uppercase small fw-bold tracking-wide">Agent Name</th>
                            <th className="py-3 text-uppercase small fw-bold tracking-wide">Contact Info</th>
                            <th className="pe-4 py-3 text-uppercase small fw-bold tracking-wide text-end">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredAgents.map(agent => (
                            <tr key={agent._id} className="border-bottom hover-bg-slate-50 transition-colors">
                            <td className="ps-4 py-3">
                                <div className="d-flex align-items-center">
                                    <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{width: '40px', height: '40px'}}>
                                        <span className="fw-bold">{agent.name.charAt(0)}</span>
                                    </div>
                                    <span className="fw-bold text-dark">{agent.name}</span>
                                </div>
                            </td>
                            <td className="py-3">
                                <div className="d-flex flex-column small">
                                    <a href={`mailto:${agent.email}`} className="text-decoration-none text-muted mb-1 hover-primary">
                                        <i className="far fa-envelope me-2 w-4 text-center"></i>{agent.email}
                                    </a>
                                    {agent.phone && (
                                        <span className="text-muted">
                                            <i className="fas fa-phone me-2 w-4 text-center"></i>{agent.phone}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="pe-4 py-3 text-end">
                                <div className="d-flex justify-content-end gap-2 opacity-75 hover-opacity-100">
                                    <Link to={`/agents/edit/${agent._id}`}>
                                        <Button variant="light" size="sm" className="btn-icon rounded-circle shadow-sm" title="Edit">
                                        <i className="fas fa-pencil-alt text-secondary"></i>
                                        </Button>
                                    </Link>

                                    <Button
                                        variant="light"
                                        size="sm"
                                        className="btn-icon rounded-circle shadow-sm"
                                        onClick={() => confirmDelete(agent)}
                                        title="Delete"
                                    >
                                        <i className="fas fa-trash-alt text-danger"></i>
                                    </Button>
                                </div>
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
                    {filteredAgents.map(agent => (
                        <Col xs={12} key={agent._id}>
                            <Card className="border-0 shadow-sm rounded-xl overflow-hidden card-hover">
                                <Card.Body className="p-4">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{width: '48px', height: '48px'}}>
                                            <span className="fw-bold fs-5">{agent.name.charAt(0)}</span>
                                        </div>
                                        <div className="fw-bold text-dark fs-5">{agent.name}</div>
                                    </div>

                                    <div className="bg-slate-50 rounded p-3 mb-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="far fa-envelope text-muted me-3"></i>
                                            <a href={`mailto:${agent.email}`} className="text-dark fw-medium text-decoration-none text-truncate d-block" style={{maxWidth: '200px'}}>{agent.email}</a>
                                        </div>
                                        {agent.phone && (
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-phone text-muted me-3"></i>
                                                <span className="text-dark fw-medium">{agent.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-grid gap-2 d-flex justify-content-end">
                                        <Link to={`/agents/edit/${agent._id}`} className="flex-grow-1">
                                            <Button variant="light" className="w-100 border">Edit</Button>
                                        </Link>
                                        <Button variant="outline-danger" className="flex-grow-0" onClick={() => confirmDelete(agent)}>
                                            <i className="fas fa-trash-alt"></i>
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static" contentClassName="border-0 shadow-lg rounded-2xl">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h5 fw-bold text-danger">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p>Are you sure you want to delete agent <strong>{agentToDelete?.name}</strong>?</p>
          <p className="small text-muted mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-3 pe-4">
          <Button variant="light" onClick={() => setShowDeleteModal(false)} className="rounded-pill px-4">
            Cancel
          </Button>
          <Button variant="danger" onClick={executeDelete} className="rounded-pill px-4 shadow-sm">
            <i className="fas fa-trash me-2"></i>Delete Agent
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default AgentList;
