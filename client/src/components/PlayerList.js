import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/players', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlayers(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch players.');
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/players/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlayers(players.filter(player => player._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete player.');
      }
    }
  };

  if (loading) return <p>Loading players...</p>;

  return (
    <div>
      <h2>Player Management</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Link to="/players/new">Add New Player</Link>
      {players.length === 0 && !loading && <p>No players found. Add one!</p>}
      {players.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Jersey Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player._id}>
                <td>{player.name}</td>
                <td>{player.position}</td>
                <td>{player.jerseyNumber}</td>
                <td>
                  <Link to={`/players/edit/${player._id}`}>Edit</Link>
                  <button onClick={() => handleDelete(player._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PlayerList;
