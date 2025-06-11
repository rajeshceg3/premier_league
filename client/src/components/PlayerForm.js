import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const PlayerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    jerseyNumber: '',
    // Add any other relevant fields for a player
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // To get player ID from URL for editing

  useEffect(() => {
    if (id) { // If ID exists, we are editing, so fetch player data
      setIsLoading(true);
      const fetchPlayerData = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`/api/players/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormData({
            name: res.data.name,
            position: res.data.position,
            jerseyNumber: res.data.jerseyNumber,
            // Set other fields from res.data
          });
          setIsLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch player data.');
          setIsLoading(false);
        }
      };
      fetchPlayerData();
    }
  }, [id]);

  const { name, position, jerseyNumber } = formData;

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
        res = await axios.put(`/api/players/${id}`, formData, config);
        setMessage('Player updated successfully!');
      } else { // Otherwise, it's a create (POST)
        res = await axios.post('/api/players', formData, config);
        setMessage('Player added successfully!');
      }

      // Wait for a bit so the user can see the message, then navigate
      setTimeout(() => {
        navigate('/players'); // Redirect to player list
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || (id ? 'Failed to update player.' : 'Failed to add player.'));
      setIsLoading(false);
    }
  };

  if (isLoading && id) return <p>Loading player data for editing...</p>;

  return (
    <form onSubmit={onSubmit}>
      <h2>{id ? 'Edit Player' : 'Add New Player'}</h2>
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
        <label htmlFor="position">Position:</label>
        <input
          type="text"
          id="position"
          name="position"
          value={position}
          onChange={onChange}
        />
      </div>
      <div>
        <label htmlFor="jerseyNumber">Jersey Number:</label>
        <input
          type="number"
          id="jerseyNumber"
          name="jerseyNumber"
          value={jerseyNumber}
          onChange={onChange}
        />
      </div>
      {/* Add other form fields as necessary */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : (id ? 'Update Player' : 'Add Player')}
      </button>
      <button type="button" onClick={() => navigate('/players')} disabled={isLoading}>
        Cancel
      </button>
    </form>
  );
};

export default PlayerForm;
