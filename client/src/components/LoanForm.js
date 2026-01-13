import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';

const LoanForm = () => {
  const [formData, setFormData] = useState({
    playerId: '',
    loaningTeamId: '',
    borrowingTeamId: '',
    agentId: '',
    startDate: '',
    endDate: '',
  });
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchRelatedData = async () => {
      setFetchingData(true);
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [playersRes, teamsRes, agentsRes] = await Promise.all([
          axios.get('/api/players', config),
          axios.get('/api/teams', config),
          axios.get('/api/agents', config),
        ]);

        setPlayers(playersRes.data);
        setTeams(teamsRes.data);
        setAgents(agentsRes.data);

        if (id) {
          const loanRes = await axios.get(`/api/loans/${id}`, config);
          const loanData = loanRes.data;
          setFormData({
            playerId: loanData.player._id,
            loaningTeamId: loanData.loaningTeam._id,
            borrowingTeamId: loanData.borrowingTeam._id,
            agentId: loanData.agent ? loanData.agent._id : '',
            startDate: loanData.startDate ? loanData.startDate.split('T')[0] : '',
            endDate: loanData.endDate ? loanData.endDate.split('T')[0] : '',
          });
        }
        setFetchingData(false);
      } catch (err) {
        toast.error('Failed to fetch data: ' + (err.response?.data?.message || err.message));
        setFetchingData(false);
      }
    };

    fetchRelatedData();
  }, [id]);

  const { playerId, loaningTeamId, borrowingTeamId, agentId, startDate, endDate } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (loaningTeamId === borrowingTeamId) {
        toast.error('Loaning and borrowing teams cannot be the same.');
        return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const payload = { ...formData };
      if (!payload.agentId) delete payload.agentId;

      if (id) {
        // Note: PUT endpoint might need updates if it doesn't support new schema yet,
        // but assuming we are fixing creation first.
        // User didn't ask to fix PUT explicitly but "bugs".
        await axios.put(`/api/loans/${id}`, payload, config);
        toast.success('Loan updated successfully!');
      } else {
        await axios.post('/api/loans', payload, config);
        toast.success('Loan created successfully!');
      }
      setTimeout(() => navigate('/loans'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || (id ? 'Failed to update loan.' : 'Failed to create loan.'));
      setLoading(false);
    }
  };

  if (fetchingData) {
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
              {id ? 'Edit Loan' : 'Create New Loan'}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="playerId">
                  <Form.Label>Player</Form.Label>
                  <Form.Select
                    name="playerId"
                    value={playerId}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select Player</option>
                    {players.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="loaningTeamId">
                  <Form.Label>Loaning Team</Form.Label>
                  <Form.Select
                    name="loaningTeamId"
                    value={loaningTeamId}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select Loaning Team</option>
                    {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="borrowingTeamId">
                  <Form.Label>Borrowing Team</Form.Label>
                  <Form.Select
                    name="borrowingTeamId"
                    value={borrowingTeamId}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select Borrowing Team</option>
                    {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="agentId">
                  <Form.Label>Agent (Optional)</Form.Label>
                  <Form.Select
                    name="agentId"
                    value={agentId}
                    onChange={onChange}
                  >
                    <option value="">Select Agent</option>
                    {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="startDate">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={startDate}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="endDate">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="endDate"
                        value={endDate}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : (id ? 'Update Loan' : 'Create Loan')}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate('/loans')} disabled={loading}>
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

export default LoanForm;
