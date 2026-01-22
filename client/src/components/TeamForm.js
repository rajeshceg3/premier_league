import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Spinner, FloatingLabel } from 'react-bootstrap';
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
        <Link to="/teams" className="text-decoration-none text-muted small hover-primary">
            <i className="fas fa-arrow-left me-1"></i> Back to Teams
        </Link>
        <h2 className="fw-bold mt-2">{id ? 'Edit Team Details' : 'Register New Team'}</h2>
        <p className="text-muted">Enter the club details and coaching staff information.</p>
      </div>

      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-4 p-md-5">
              <Form onSubmit={onSubmit}>
                <h5 className="mb-4 text-primary fw-bold border-bottom pb-2">Team Information</h5>

                <FloatingLabel controlId="name" label="Team Name" className="mb-3">
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                    placeholder="e.g. Manchester United"
                    className="bg-light border-0"
                  />
                </FloatingLabel>

                <FloatingLabel controlId="coach" label="Head Coach" className="mb-3">
                  <Form.Control
                    type="text"
                    name="coach"
                    value={coach}
                    onChange={onChange}
                    required
                    placeholder="e.g. Erik ten Hag"
                    className="bg-light border-0"
                  />
                </FloatingLabel>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button variant="light" onClick={() => navigate('/teams')} disabled={loading} className="px-4">
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading} className="px-4 shadow-sm">
                    {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/> : null}
                    {id ? 'Save Changes' : 'Create Team'}
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

export default TeamForm;
