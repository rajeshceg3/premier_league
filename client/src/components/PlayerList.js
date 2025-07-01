import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AddToWatchlistButton from './AddToWatchlistButton'; // Import AddToWatchlistButton
import { getWatchlist } from '../services/apiClient'; // Import getWatchlist

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const [userWatchlistIds, setUserWatchlistIds] = useState(new Set()); // For storing IDs of watched players
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please login.');
          setLoading(false);
          return;
        }

        // Fetch players
        const playersRes = await axios.get('/api/players', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlayers(playersRes.data);

        // Fetch user's watchlist
        try {
          const watchlist = await getWatchlist(); // apiClient handles token
          setUserWatchlistIds(new Set(watchlist.map(p => p._id)));
        } catch (watchlistError) {
          console.error("Failed to fetch user's watchlist", watchlistError);
          // Not setting main error for this, but logging it.
          // PlayerList can still function without watchlist info.
        }

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data.');
        setLoading(false);
      }
    };

    fetchData();
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
                  <AddToWatchlistButton
                    playerId={player._id}
                    isInitiallyWatched={userWatchlistIds.has(player._id)}
                  />
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
