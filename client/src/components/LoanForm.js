import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const LoanForm = () => {
  const [formData, setFormData] = useState({
    player: '',
    loaningTeam: '',
    borrowingTeam: '',
    agent: '',
    startDate: '',
    endDate: '',
    // Add any other relevant fields for a loan
  });
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRelatedData, setIsFetchingRelatedData] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams(); // To get loan ID from URL for editing

  useEffect(() => {
    const fetchRelatedData = async () => {
      setIsFetchingRelatedData(true);
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

        if (id) { // If editing, fetch loan data after related data is loaded
          const loanRes = await axios.get(`/api/loans/${id}`, config);
          const loanData = loanRes.data;
          setFormData({
            player: loanData.player,
            loaningTeam: loanData.loaningTeam,
            borrowingTeam: loanData.borrowingTeam,
            agent: loanData.agent,
            startDate: loanData.startDate ? loanData.startDate.split('T')[0] : '', // Format for date input
            endDate: loanData.endDate ? loanData.endDate.split('T')[0] : '', // Format for date input
          });
        }
        setIsFetchingRelatedData(false);
      } catch (err) {
        setError('Failed to fetch related data for the form. ' + (err.response?.data?.message || err.message));
        setIsFetchingRelatedData(false);
      }
    };

    fetchRelatedData();
  }, [id]);

  const { player, loaningTeam, borrowingTeam, agent, startDate, endDate } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    // Basic validation
    if (loaningTeam === borrowingTeam && loaningTeam !== '') {
        setError('Loaning team and borrowing team cannot be the same.');
        setIsLoading(false);
        return;
    }

    try {
      const payload = { ...formData };
      // Ensure empty strings are not sent if agent is optional, or handle as needed by backend
      if (!payload.agent) delete payload.agent;

      if (id) {
        await axios.put(`/api/loans/${id}`, payload, config);
        setMessage('Loan updated successfully!');
      } else {
        await axios.post('/api/loans', payload, config);
        setMessage('Loan added successfully!');
      }

      setTimeout(() => {
        navigate('/loans');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || (id ? 'Failed to update loan.' : 'Failed to add loan.'));
      setIsLoading(false);
    }
  };

  if (isFetchingRelatedData) return <p>Loading form data...</p>;

  return (
    <form onSubmit={onSubmit}>
      <h2>{id ? 'Edit Loan' : 'Add New Loan'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <div>
        <label htmlFor="player">Player:</label>
        <select id="player" name="player" value={player} onChange={onChange} required>
          <option value="">Select Player</option>
          {players.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="loaningTeam">Loaning Team:</label>
        <select id="loaningTeam" name="loaningTeam" value={loaningTeam} onChange={onChange} required>
          <option value="">Select Loaning Team</option>
          {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="borrowingTeam">Borrowing Team:</label>
        <select id="borrowingTeam" name="borrowingTeam" value={borrowingTeam} onChange={onChange} required>
          <option value="">Select Borrowing Team</option>
          {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="agent">Agent (Optional):</label>
        <select id="agent" name="agent" value={agent} onChange={onChange}>
          <option value="">Select Agent (Optional)</option>
          {agents.map(a => <option key={a._id} value={a._id}>{a.name} ({a.email})</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="startDate">Start Date:</label>
        <input type="date" id="startDate" name="startDate" value={startDate} onChange={onChange} required />
      </div>

      <div>
        <label htmlFor="endDate">End Date:</label>
        <input type="date" id="endDate" name="endDate" value={endDate} onChange={onChange} required />
      </div>

      <button type="submit" disabled={isLoading || isFetchingRelatedData}>
        {isLoading ? 'Submitting...' : (id ? 'Update Loan' : 'Add Loan')}
      </button>
      <button type="button" onClick={() => navigate('/loans')} disabled={isLoading || isFetchingRelatedData}>
        Cancel
      </button>
    </form>
  );
};

export default LoanForm;
