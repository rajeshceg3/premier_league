import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';

const PlayerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    jerseyNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setLoading(true);
      const fetchPlayerData = async () => {
        try {
          const res = await apiClient.get(`/players/${id}`);
          setFormData({
            name: res.data.name,
            position: res.data.position || '',
            jerseyNumber: res.data.jerseyNumber || '',
          });
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to fetch player data.');
          navigate('/players');
        } finally {
          setLoading(false);
        }
      };
      fetchPlayerData();
    }
  }, [id, navigate]);

  const { name, position, jerseyNumber } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await apiClient.put(`/players/${id}`, formData);
        toast.success('Player updated successfully!');
      } else {
        await apiClient.post('/players', formData);
        toast.success('Player added successfully!');
      }
      navigate('/players');
    } catch (err) {
      toast.error(err.response?.data?.message || (id ? 'Failed to update player.' : 'Failed to add player.'));
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
              {id ? 'Edit Player' : 'Register New Player'}
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
                    placeholder="e.g. Harry Kane"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="position">
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    type="text"
                    name="position"
                    value={position}
                    onChange={onChange}
                    placeholder="e.g. Forward"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="jerseyNumber">
                  <Form.Label>Jersey Number</Form.Label>
                  <Form.Control
                    type="number"
                    name="jerseyNumber"
                    value={jerseyNumber}
                    onChange={onChange}
                    placeholder="e.g. 10"
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : (id ? 'Update Player' : 'Register Player')}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate('/players')} disabled={loading}>
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

export default PlayerForm;
