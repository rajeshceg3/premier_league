import React, { useState, useEffect, useCallback } from 'react';
import { getWatchlist } from '../services/apiClient';
import AddToWatchlistButton from './AddToWatchlistButton';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWatchlistData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWatchlist();
      setWatchlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching watchlist:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || 'Failed to fetch watchlist');
      setWatchlist([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWatchlistData();
  }, [fetchWatchlistData]);

  const handleWatchlistToggle = (toggledPlayerId, newWatchedStatus) => {
    if (!newWatchedStatus) {
      setWatchlist(prevWatchlist => prevWatchlist.filter(player => player._id !== toggledPlayerId));
    }
  };

  if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
            <Spinner animation="border" role="status" variant="warning">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
      );
  }

  return (
    <div className="fade-in">
       <div className="mb-4">
           <h2 className="fw-bold text-secondary mb-1">My Watchlist</h2>
           <p className="text-muted mb-0">Track players you are interested in.</p>
       </div>

      {error ? (
           <Alert variant="danger" className="text-center">
                <Alert.Heading>Error Loading Watchlist</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={fetchWatchlistData} size="sm">Retry</Button>
            </Alert>
      ) : watchlist.length === 0 ? (
          <div className="text-center py-5">
              <div className="mb-3 text-muted"><i className="far fa-star fa-3x"></i></div>
              <h5 className="text-muted">Your watchlist is empty</h5>
              <p className="text-muted mb-4">Start following players to see them here.</p>
              <Link to="/players">
                <Button variant="primary">Browse Players</Button>
              </Link>
          </div>
      ) : (
          <Row xs={1} md={2} lg={3} xl={4} className="g-4">
            {watchlist.map(player => (
              <Col key={player._id}>
                <Card className="h-100 border-0 shadow-sm card-hover">
                   <div className="position-absolute top-0 end-0 p-3">
                       <i className="fas fa-star text-warning"></i>
                   </div>
                  <Card.Body className="text-center pt-4">
                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                        <span className="h4 mb-0 text-secondary fw-bold">{player.name.charAt(0)}</span>
                    </div>

                    <Card.Title className="fw-bold text-dark">{player.name || 'Unnamed Player'}</Card.Title>
                    <Card.Subtitle className="mb-3 text-muted small">{player.team?.name || 'Free Agent'}</Card.Subtitle>

                    <div className="d-flex justify-content-center gap-2 mb-3">
                        <span className="badge bg-light text-dark border">{player.position || 'Unknown'}</span>
                        <span className="badge bg-light text-dark border">#{player.jerseyNumber || 'N/A'}</span>
                    </div>

                    <div className="mt-3">
                        <AddToWatchlistButton
                        playerId={player._id}
                        isInitiallyWatched={true}
                        onToggle={(newStatus) => handleWatchlistToggle(player._id, newStatus)}
                        />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
      )}
    </div>
  );
};

export default WatchlistPage;
