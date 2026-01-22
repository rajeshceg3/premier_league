import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Table, Button, Spinner, Card, Modal, InputGroup, Form } from 'react-bootstrap';
import apiClient from '../services/apiClient';

const AgentList = () => {
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
          <Link to="/agents/new">
            <Button variant="warning" className="shadow-sm text-white">
              <i className="fas fa-plus me-2"></i> Register Agent
            </Button>
          </Link>
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
                    placeholder="Search agents by name or email..."
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
              <Spinner animation="border" role="status" variant="warning">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3 text-muted"><i className="fas fa-user-tie fa-3x"></i></div>
              <p className="text-muted">No agents found.</p>
               {searchTerm && <Button variant="link" onClick={() => setSearchTerm('')}>Clear Search</Button>}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 table-borderless">
                <thead className="bg-light text-secondary border-bottom">
                  <tr>
                    <th className="ps-4 py-3 text-uppercase small fw-bold">Agent Name</th>
                    <th className="py-3 text-uppercase small fw-bold">Contact Info</th>
                    <th className="pe-4 py-3 text-uppercase small fw-bold text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map(agent => (
                    <tr key={agent._id} className="border-bottom">
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center">
                            <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                                <span className="fw-bold">{agent.name.charAt(0)}</span>
                            </div>
                            <span className="fw-bold text-dark">{agent.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                         <div className="d-flex flex-column">
                            <a href={`mailto:${agent.email}`} className="text-decoration-none text-muted mb-1 hover-primary">
                                <i className="far fa-envelope me-2 small"></i>{agent.email}
                            </a>
                            {agent.phone && (
                                <span className="text-muted small">
                                    <i className="fas fa-phone me-2 small"></i>{agent.phone}
                                </span>
                            )}
                         </div>
                      </td>
                      <td className="pe-4 py-3 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Link to={`/agents/edit/${agent._id}`}>
                            <Button variant="light" size="sm" className="text-secondary hover-primary" title="Edit">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </Link>

                          <Button
                            variant="light"
                            size="sm"
                            className="text-danger hover-danger"
                            onClick={() => confirmDelete(agent)}
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
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h5 fw-bold text-danger">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p>Are you sure you want to delete agent <strong>{agentToDelete?.name}</strong>?</p>
          <p className="small text-muted mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={executeDelete}>
            <i className="fas fa-trash me-2"></i>Delete Agent
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default AgentList;
