import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/agents', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAgents(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch agents.');
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/agents/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAgents(agents.filter(agent => agent._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete agent.');
      }
    }
  };

  if (loading) return <p>Loading agents...</p>;

  return (
    <div>
      <h2>Agent Management</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Link to="/agents/new">Add New Agent</Link>
      {agents.length === 0 && !loading && <p>No agents found. Add one!</p>}
      {agents.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              {/* Add other relevant agent fields here */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr key={agent._id}>
                <td>{agent.name}</td>
                <td>{agent.email}</td>
                {/* Render other agent data */}
                <td>
                  <Link to={`/agents/edit/${agent._id}`}>Edit</Link>
                  <button onClick={() => handleDelete(agent._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AgentList;
