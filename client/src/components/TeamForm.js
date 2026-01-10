import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const TeamForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    coach: '',
    // Add any other relevant fields for a team
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // To get team ID from URL for editing

  useEffect(() => {
    if (id) { // If ID exists, we are editing, so fetch team data
      setIsLoading(true);
      const fetchTeamData = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`/api/teams/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormData({
            name: res.data.name,
            coach: res.data.coach,
            // Set other fields from res.data
          });
          setIsLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch team data.');
          setIsLoading(false);
        }
      };
      fetchTeamData();
    }
  }, [id]);

  const { name, coach } = formData;

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
      if (id) { // If ID exists, it's an update (PUT)
        await axios.put(`/api/teams/${id}`, formData, config);
        setMessage('Team updated successfully!');
      } else { // Otherwise, it's a create (POST)
        await axios.post('/api/teams', formData, config);
        setMessage('Team added successfully!');
      }

      setTimeout(() => {
        navigate('/teams'); // Redirect to team list
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || (id ? 'Failed to update team.' : 'Failed to add team.'));
      setIsLoading(false);
    }
  };

  if (isLoading && id) return <p>Loading team data for editing...</p>;

  return (
    <form onSubmit={onSubmit}>
      <h2>{id ? 'Edit Team' : 'Add New Team'}</h2>
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
        <label htmlFor="coach">Coach:</label>
        <input
          type="text"
          id="coach"
          name="coach"
          value={coach}
          onChange={onChange}
           required // Add this line
        />
      </div>
      {/* Add other form fields as necessary */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : (id ? 'Update Team' : 'Add Team')}
      </button>
      <button type="button" onClick={() => navigate('/teams')} disabled={isLoading}>
        Cancel
      </button>
    </form>
  );
};

export default TeamForm;
