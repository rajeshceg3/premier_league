import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
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
          const token = localStorage.getItem('token');
          const res = await axios.get(`/api/agents/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
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
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (id) {
        await axios.put(`/api/agents/${id}`, formData, config);
        toast.success('Agent updated successfully!');
      } else {
        await axios.post('/api/agents', formData, config);
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
          <Container className="d-flex justify-content-center mt-5">
              <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
              </Spinner>
          </Container>
      );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Header as="h4" className="bg-warning text-dark text-center">
              {id ? 'Edit Agent' : 'Register New Agent'}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                    placeholder="e.g. Jorge Mendes"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    placeholder="e.g. jorge@agency.com"
                  />
                </Form.Group>

                 <Form.Group className="mb-3" controlId="phone">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={phone}
                    onChange={onChange}
                    placeholder="e.g. +44 7700 900000"
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="warning" type="submit" disabled={loading}>
                     {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : (id ? 'Update Agent' : 'Register Agent')}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate('/agents')} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AgentForm;
