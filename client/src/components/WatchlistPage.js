import React, { useState, useEffect, useCallback } from 'react';
import { getWatchlist } from '../services/apiClient';
import AddToWatchlistButton from './AddToWatchlistButton';

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWatchlistData = useCallback(async () => {
    setLoading(true);
    setError(null); // Reset error state before fetching
    try {
      const data = await getWatchlist();
      setWatchlist(Array.isArray(data) ? data : []); // Ensure data is an array
    } catch (err) {
      console.error('Error fetching watchlist:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || 'Failed to fetch watchlist');
      setWatchlist([]); // Clear watchlist on error
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWatchlistData();
  }, [fetchWatchlistData]);

  const handleWatchlistToggle = (toggledPlayerId, newWatchedStatus) => {
    // If a player is removed from the watchlist (newWatchedStatus is false),
    // filter them out from the local state to update the UI optimistically.
    if (!newWatchedStatus) {
      setWatchlist(prevWatchlist => prevWatchlist.filter(player => player._id !== toggledPlayerId));
    }
    // If newWatchedStatus is true, it means it was added.
    // However, this page primarily shows players already in the watchlist.
    // Re-fetching might be an option if consistency is critical or if adds happen from elsewhere.
    // For now, just removing is the primary concern for this page.
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '20px' }}>Loading watchlist...</p>;
  if (error) return <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Error: {error}</p>;

  if (watchlist.length === 0) return <p style={{ textAlign: 'center', padding: '20px' }}>Your watchlist is empty.</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>My Watchlist</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        {watchlist.map(player => (
          <div
            key={player._id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              width: '300px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <h4 style={{ marginTop: '0', marginBottom: '10px' }}>{player.name || 'Unnamed Player'}</h4>
            <p style={{ marginBottom: '5px' }}>Team: {player.team?.name || 'N/A'}</p>
            <p style={{ marginBottom: '15px' }}>Nationality: {player.nationality || 'N/A'}</p>
            <AddToWatchlistButton
              playerId={player._id}
              isInitiallyWatched={true} // All players on this page are initially watched
              onToggle={(newStatus) => handleWatchlistToggle(player._id, newStatus)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchlistPage;
