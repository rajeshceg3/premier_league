import React, { useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
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
      variant={watched ? "warning" : "light"}
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className={watched ? "text-white shadow-sm" : "text-secondary hover-warning"}
      aria-label={watched ? 'Remove from Watchlist' : 'Add to Watchlist'}
      title={watched ? 'Remove from Watchlist' : 'Add to Watchlist'}
    >
      {loading ? (
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
      ) : watched ? (
        <><i className="fas fa-star me-1"></i>Unwatch</>
      ) : (
        <><i className="far fa-star me-1"></i>Watch</>
      )}
    </Button>
  );
};

export default AddToWatchlistButton;
