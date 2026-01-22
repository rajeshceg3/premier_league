import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Spinner, FloatingLabel } from 'react-bootstrap';
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
        const [playersRes, teamsRes, agentsRes] = await Promise.all([
          apiClient.get('/players'),
          apiClient.get('/teams'),
          apiClient.get('/agents'),
        ]);

        setPlayers(playersRes.data);
        setTeams(teamsRes.data);
        setAgents(agentsRes.data);

        if (id) {
          const loanRes = await apiClient.get(`/loans/${id}`);
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
        console.error("Error fetching loan data", err);
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

    if (new Date(startDate) > new Date(endDate)) {
        toast.error('Start Date cannot be after End Date.');
        return;
    }

    setLoading(true);

    try {
      const payload = { ...formData };
      if (!payload.agentId) delete payload.agentId;

      if (id) {
        await apiClient.put(`/loans/${id}`, payload);
        toast.success('Loan updated successfully!');
      } else {
        await apiClient.post('/loans', payload);
        toast.success('Loan created successfully!');
      }
      navigate('/loans');
    } catch (err) {
      toast.error(err.response?.data?.message || (id ? 'Failed to update loan.' : 'Failed to create loan.'));
      setLoading(false);
    }
  };

  if (fetchingData) {
      return (
          <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
              <Spinner animation="border" role="status" variant="info">
                  <span className="visually-hidden">Loading...</span>
              </Spinner>
          </div>
      );
  }

  return (
    <div className="fade-in">
       <div className="mb-4">
        <Link to="/loans" className="text-decoration-none text-muted small hover-primary">
            <i className="fas fa-arrow-left me-1"></i> Back to Loans
        </Link>
        <h2 className="fw-bold mt-2">{id ? 'Edit Loan Agreement' : 'New Loan Agreement'}</h2>
        <p className="text-muted">Configure the terms of the player loan between clubs.</p>
      </div>

      <Row className="justify-content-center">
        <Col lg={8} xl={7}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-4 p-md-5">
              <Form onSubmit={onSubmit}>
                <h5 className="mb-4 text-info fw-bold border-bottom pb-2">Agreement Details</h5>

                <Row className="g-3">
                    <Col md={12}>
                        <FloatingLabel controlId="playerId" label="Select Player">
                            <Form.Select
                                name="playerId"
                                value={playerId}
                                onChange={onChange}
                                required
                                className="bg-light border-0"
                            >
                                <option value="">-- Choose Player --</option>
                                {players.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </Form.Select>
                        </FloatingLabel>
                    </Col>

                    <Col md={6}>
                        <FloatingLabel controlId="loaningTeamId" label="Loaning Team (From)">
                            <Form.Select
                                name="loaningTeamId"
                                value={loaningTeamId}
                                onChange={onChange}
                                required
                                className="bg-light border-0"
                            >
                                <option value="">-- Choose Team --</option>
                                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </Form.Select>
                        </FloatingLabel>
                    </Col>

                    <Col md={6}>
                        <FloatingLabel controlId="borrowingTeamId" label="Borrowing Team (To)">
                            <Form.Select
                                name="borrowingTeamId"
                                value={borrowingTeamId}
                                onChange={onChange}
                                required
                                className="bg-light border-0"
                            >
                                <option value="">-- Choose Team --</option>
                                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </Form.Select>
                        </FloatingLabel>
                    </Col>

                    <Col md={12}>
                         <FloatingLabel controlId="agentId" label="Agent (Optional)">
                            <Form.Select
                                name="agentId"
                                value={agentId}
                                onChange={onChange}
                                className="bg-light border-0"
                            >
                                <option value="">-- Select Agent --</option>
                                {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                            </Form.Select>
                        </FloatingLabel>
                    </Col>

                    <Col md={6}>
                        <FloatingLabel controlId="startDate" label="Start Date">
                            <Form.Control
                                type="date"
                                name="startDate"
                                value={startDate}
                                onChange={onChange}
                                required
                                className="bg-light border-0"
                            />
                        </FloatingLabel>
                    </Col>

                    <Col md={6}>
                        <FloatingLabel controlId="endDate" label="End Date">
                            <Form.Control
                                type="date"
                                name="endDate"
                                value={endDate}
                                onChange={onChange}
                                required
                                className="bg-light border-0"
                            />
                        </FloatingLabel>
                    </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2 mt-5">
                  <Button variant="light" onClick={() => navigate('/loans')} disabled={loading} className="px-4">
                    Cancel
                  </Button>
                  <Button variant="info" type="submit" disabled={loading} className="px-4 shadow-sm text-white">
                    {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> : null}
                    {id ? 'Update Loan' : 'Create Loan'}
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

export default LoanForm;
