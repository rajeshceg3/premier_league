import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Table, Button, Spinner, Card, Row, Col, Modal } from 'react-bootstrap';
import apiClient from '../services/apiClient';

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/agents');
        setAgents(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch agents.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const confirmDelete = (agent) => {
    setAgentToDelete(agent);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!agentToDelete) return;
    try {
      await apiClient.delete(`/agents/${agentToDelete._id}`);
      setAgents(agents.filter(agent => agent._id !== agentToDelete._id));
      toast.success('Agent deleted successfully.');
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete agent.');
    }
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>Agent Management</h2>
        </Col>
        <Col className="text-end">
          <Link to="/agents/new">
            <Button variant="primary">
              <i className="fas fa-plus"></i> Add New Agent
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
          ) : agents.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No agents found.</p>
              <Link to="/agents/new">
                <Button variant="outline-primary" size="sm">Create First Agent</Button>
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover striped bordered className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map(agent => (
                    <tr key={agent._id}>
                      <td className="fw-bold">{agent.name}</td>
                      <td>
                         <a href={`mailto:${agent.email}`}>{agent.email}</a>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link to={`/agents/edit/${agent._id}`}>
                            <Button variant="outline-primary" size="sm" title="Edit">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </Link>

                          <Button
                            variant="outline-danger"
                            size="sm"
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
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete agent <strong>{agentToDelete?.name}</strong>?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={executeDelete}>
            Delete Agent
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default AgentList;
