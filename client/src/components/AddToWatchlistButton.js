import React, { useState, useEffect } from 'react';
import { addToWatchlist, removeFromWatchlist } from '../services/apiClient';

const AddToWatchlistButton = ({ playerId, isInitiallyWatched, onToggle }) => {
  const [watched, setWatched] = useState(isInitiallyWatched);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setWatched(isInitiallyWatched);
  }, [isInitiallyWatched]);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (watched) {
        await removeFromWatchlist(playerId);
        setWatched(false);
        if (onToggle) onToggle(false); // Pass new watched state (false)
      } else {
        await addToWatchlist(playerId);
        setWatched(true);
        if (onToggle) onToggle(true); // Pass new watched state (true)
      }
    } catch (error) {
      console.error("Failed to toggle watchlist", error.response?.data || error.message);
      // Optionally, display a more user-friendly error message
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={watched ? 'Remove from Watchlist' : 'Add to Watchlist'}
      style={{ padding: '8px 12px', cursor: loading ? 'not-allowed' : 'pointer' }}
    >
      {loading ? '...' : (watched ? 'Remove from Watchlist' : 'Add to Watchlist')}
    </button>
  );
};

export default AddToWatchlistButton;
