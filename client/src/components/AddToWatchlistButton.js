import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
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
        if (onToggle) onToggle(false);
      } else {
        await addToWatchlist(playerId);
        setWatched(true);
        if (onToggle) onToggle(true);
      }
    } catch (error) {
      console.error("Failed to toggle watchlist", error.response?.data || error.message);
    }
    setLoading(false);
  };

  return (
    <Button
      variant={watched ? "outline-warning" : "outline-success"}
      size="sm"
      onClick={handleClick}
      disabled={loading}
      aria-label={watched ? 'Remove from Watchlist' : 'Add to Watchlist'}
      title={watched ? 'Remove from Watchlist' : 'Add to Watchlist'}
    >
      {loading ? '...' : (watched ? 'Remove from Watchlist' : 'Add to Watchlist')}
    </Button>
  );
};

export default AddToWatchlistButton;
