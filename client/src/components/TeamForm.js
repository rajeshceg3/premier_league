import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';

const TeamForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    coach: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setLoading(true);
      const fetchTeamData = async () => {
        try {
          const res = await apiClient.get(`/teams/${id}`);
          setFormData({
            name: res.data.name,
            coach: res.data.coach,
          });
          setLoading(false);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to fetch team data.');
          setLoading(false);
        }
      };
      fetchTeamData();
    }
  }, [id]);

  const { name, coach } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await apiClient.put(`/teams/${id}`, formData);
        toast.success('Team updated successfully!');
      } else {
        await apiClient.post('/teams', formData);
        toast.success('Team added successfully!');
      }
      navigate('/teams');
    } catch (err) {
      toast.error(err.response?.data?.message || (id ? 'Failed to update team.' : 'Failed to add team.'));
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
            <Card.Header as="h4" className="bg-primary text-white text-center">
              {id ? 'Edit Team' : 'Register New Team'}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Team Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                    placeholder="e.g. Manchester United"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="coach">
                  <Form.Label>Coach</Form.Label>
                  <Form.Control
                    type="text"
                    name="coach"
                    value={coach}
                    onChange={onChange}
                    required
                    placeholder="e.g. Erik ten Hag"
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : (id ? 'Update Team' : 'Register Team')}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate('/teams')} disabled={loading}>
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

export default TeamForm;
