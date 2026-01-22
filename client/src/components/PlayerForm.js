import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Spinner, FloatingLabel } from 'react-bootstrap';
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
          <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
              <Spinner animation="border" role="status" variant="primary">
                  <span className="visually-hidden">Loading...</span>
              </Spinner>
          </div>
      );
  }

  return (
    <div className="fade-in">
      <div className="mb-4">
        <Link to="/players" className="text-decoration-none text-muted small hover-primary">
            <i className="fas fa-arrow-left me-1"></i> Back to Players
        </Link>
        <h2 className="fw-bold mt-2">{id ? 'Edit Player Profile' : 'New Player Registration'}</h2>
        <p className="text-muted">Enter the details below to {id ? 'update the' : 'create a new'} player record.</p>
      </div>

      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-4 p-md-5">
              <Form onSubmit={onSubmit}>
                <h5 className="mb-4 text-primary fw-bold border-bottom pb-2">Player Information</h5>

                <FloatingLabel controlId="name" label="Full Name" className="mb-3">
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                    placeholder="e.g. Harry Kane"
                    className="bg-light border-0"
                  />
                </FloatingLabel>

                <Row>
                    <Col md={6}>
                        <FloatingLabel controlId="position" label="Position" className="mb-3">
                        <Form.Control
                            type="text"
                            name="position"
                            value={position}
                            onChange={onChange}
                            placeholder="e.g. Forward"
                            className="bg-light border-0"
                        />
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel controlId="jerseyNumber" label="Jersey Number" className="mb-3">
                        <Form.Control
                            type="number"
                            name="jerseyNumber"
                            value={jerseyNumber}
                            onChange={onChange}
                            placeholder="e.g. 10"
                            className="bg-light border-0"
                        />
                        </FloatingLabel>
                    </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button variant="light" onClick={() => navigate('/players')} disabled={loading} className="px-4">
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading} className="px-4 shadow-sm">
                    {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/> : null}
                    {id ? 'Save Changes' : 'Create Player'}
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

export default PlayerForm;
