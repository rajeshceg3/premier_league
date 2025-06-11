import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LoanList = () => {
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [relatedData, setRelatedData] = useState({
    players: {},
    teams: {},
    agents: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch loans, players, teams, and agents in parallel
        const [loansRes, playersRes, teamsRes, agentsRes] = await Promise.all([
          axios.get('/api/loans', config),
          axios.get('/api/players', config),
          axios.get('/api/teams', config),
          axios.get('/api/agents', config),
        ]);

        setLoans(loansRes.data);

        const playersMap = playersRes.data.reduce((acc, player) => {
          acc[player._id] = player.name;
          return acc;
        }, {});
        const teamsMap = teamsRes.data.reduce((acc, team) => {
          acc[team._id] = team.name;
          return acc;
        }, {});
        const agentsMap = agentsRes.data.reduce((acc, agent) => {
          acc[agent._id] = agent.name;
          return acc;
        }, {});

        setRelatedData({ players: playersMap, teams: teamsMap, agents: agentsMap });
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/loans/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLoans(loans.filter(loan => loan._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete loan.');
      }
    }
  };

  const handleMarkAsReturned = async (loanId) => {
    if (window.confirm('Are you sure you want to mark this loan as returned?')) {
      try {
        const token = localStorage.getItem('token');
        // Assuming the endpoint is /api/returns/:loanId/return as per subtask description
        // And it's a POST request. The body might be empty or expect specific return details.
        const res = await axios.post(`/api/returns/${loanId}/return`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Update the specific loan in the list to reflect its new status
        // The backend should ideally return the updated loan object or at least the new status and returnedDate
        setLoans(loans.map(loan =>
          loan._id === loanId ? { ...loan, status: 'Returned', returnedDate: res.data.returnedDate || new Date().toISOString() } : loan
        ));
        setError(''); // Clear previous errors
        // Optionally, display a success message like: setMessage('Loan marked as returned successfully!');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to mark loan as returned.');
      }
    }
  };

  if (loading) return <p>Loading loans...</p>;

  return (
    <div>
      <h2>Loan Management</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Link to="/loans/new">Add New Loan</Link>
      {loans.length === 0 && !loading && <p>No loans found. Add one!</p>}
      {loans.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Loaning Team</th>
              <th>Borrowing Team</th>
              <th>Agent</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th> {/* Added Status column */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map(loan => (
              <tr key={loan._id}>
                <td>{relatedData.players[loan.player] || 'N/A'}</td>
                <td>{relatedData.teams[loan.loaningTeam] || 'N/A'}</td>
                <td>{relatedData.teams[loan.borrowingTeam] || 'N/A'}</td>
                <td>{relatedData.agents[loan.agent] || 'N/A'}</td>
                <td>{new Date(loan.startDate).toLocaleDateString()}</td>
                <td>{new Date(loan.endDate).toLocaleDateString()}</td>
                <td>{loan.status || 'Active'}</td> {/* Display loan status, default to Active */}
                <td>
                  <Link to={`/loans/edit/${loan._id}`}>Edit</Link>
                  <button onClick={() => handleDelete(loan._id)} style={{ marginLeft: '5px' }}>Delete</button>
                  {/* Only show "Mark as Returned" if not already returned and status indicates it can be returned */}
                  {loan.status !== 'Returned' && (
                    <button
                      onClick={() => handleMarkAsReturned(loan._id)}
                      style={{ marginLeft: '5px' }}
                    >
                      Mark as Returned
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LoanList;
