import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const AgentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // Add any other relevant fields for an agent
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // To get agent ID from URL for editing

  useEffect(() => {
    if (id) { // If ID exists, we are editing, so fetch agent data
      setIsLoading(true);
      const fetchAgentData = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`/api/agents/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormData({
            name: res.data.name,
            email: res.data.email,
            // Set other fields from res.data
          });
          setIsLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch agent data.');
          setIsLoading(false);
        }
      };
      fetchAgentData();
    }
  }, [id]);

  const { name, email } = formData;

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

    try {
      let res;
      if (id) { // If ID exists, it's an update (PUT)
        res = await axios.put(`/api/agents/${id}`, formData, config);
        setMessage('Agent updated successfully!');
      } else { // Otherwise, it's a create (POST)
        res = await axios.post('/api/agents', formData, config);
        setMessage('Agent added successfully!');
      }

      setTimeout(() => {
        navigate('/agents'); // Redirect to agent list
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || (id ? 'Failed to update agent.' : 'Failed to add agent.'));
      setIsLoading(false);
    }
  };

  if (isLoading && id) return <p>Loading agent data for editing...</p>;

  return (
    <form onSubmit={onSubmit}>
      <h2>{id ? 'Edit Agent' : 'Add New Agent'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={onChange}
          required
        />
      </div>
      {/* Add other form fields as necessary */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : (id ? 'Update Agent' : 'Add Agent')}
      </button>
      <button type="button" onClick={() => navigate('/agents')} disabled={isLoading}>
        Cancel
      </button>
    </form>
  );
};

export default AgentForm;
