import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Spinner, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';

const AgentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setLoading(true);
      const fetchAgentData = async () => {
        try {
          const res = await apiClient.get(`/agents/${id}`);
          setFormData({
            name: res.data.name,
            email: res.data.email || '',
            phone: res.data.phone || '',
          });
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to fetch agent data.');
          navigate('/agents');
        } finally {
          setLoading(false);
        }
      };
      fetchAgentData();
    }
  }, [id, navigate]);

  const { name, email, phone } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await apiClient.put(`/agents/${id}`, formData);
        toast.success('Agent updated successfully!');
      } else {
        await apiClient.post('/agents', formData);
        toast.success('Agent added successfully!');
      }
      navigate('/agents');
    } catch (err) {
      toast.error(err.response?.data?.message || (id ? 'Failed to update agent.' : 'Failed to add agent.'));
      setLoading(false);
    }
  };

  if (loading && id && !name) {
      return (
          <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
              <Spinner animation="border" role="status" variant="warning">
                  <span className="visually-hidden">Loading...</span>
              </Spinner>
          </div>
      );
  }

  return (
    <div className="fade-in">
       <div className="mb-4">
        <Link to="/agents" className="text-decoration-none text-muted small hover-primary">
            <i className="fas fa-arrow-left me-1"></i> Back to Agents
        </Link>
        <h2 className="fw-bold mt-2">{id ? 'Edit Agent Profile' : 'Register New Agent'}</h2>
        <p className="text-muted">Enter the agent's contact and agency information.</p>
      </div>

      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-4 p-md-5">
              <Form onSubmit={onSubmit}>
                <h5 className="mb-4 text-warning fw-bold border-bottom pb-2">Agent Information</h5>

                <FloatingLabel controlId="name" label="Full Name" className="mb-3">
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                    placeholder="e.g. Jorge Mendes"
                    className="bg-light border-0"
                  />
                </FloatingLabel>

                <FloatingLabel controlId="email" label="Email Address" className="mb-3">
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    placeholder="e.g. jorge@agency.com"
                    className="bg-light border-0"
                  />
                </FloatingLabel>

                <FloatingLabel controlId="phone" label="Phone Number" className="mb-3">
                  <Form.Control
                    type="text"
                    name="phone"
                    value={phone}
                    onChange={onChange}
                    placeholder="e.g. +44 7700 900000"
                    className="bg-light border-0"
                  />
                </FloatingLabel>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button variant="light" onClick={() => navigate('/agents')} disabled={loading} className="px-4">
                    Cancel
                  </Button>
                  <Button variant="warning" type="submit" disabled={loading} className="px-4 shadow-sm text-white">
                     {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> : null}
                     {id ? 'Save Changes' : 'Create Agent'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AgentForm;
