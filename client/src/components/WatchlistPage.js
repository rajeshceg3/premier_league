import React, { useState, useEffect, useCallback } from 'react';
import { getWatchlist } from '../services/apiClient';
import AddToWatchlistButton from './AddToWatchlistButton';
import { Container, Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';

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
        <Container className="d-flex justify-content-center align-items-center vh-50 mt-5">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </Container>
      );
  }

  if (error) {
      return (
        <Container className="mt-4">
             <Alert variant="danger" className="text-center">
                <Alert.Heading>Error</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={fetchWatchlistData}>Retry</Button>
            </Alert>
        </Container>
      );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">My Watchlist</h1>
      </div>

      {watchlist.length === 0 ? (
          <Alert variant="info" className="text-center">
            Your watchlist is empty. <br/>
            Go to <a href="/players" className="alert-link">Players</a> to add some.
          </Alert>
      ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {watchlist.map(player => (
              <Col key={player._id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title>{player.name || 'Unnamed Player'}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{player.team?.name || 'No Team'}</Card.Subtitle>
                    <Card.Text>
                        <strong>Nationality:</strong> {player.nationality || 'N/A'} <br />
                        <strong>Position:</strong> {player.position || 'N/A'}
                    </Card.Text>
                    <AddToWatchlistButton
                      playerId={player._id}
                      isInitiallyWatched={true}
                      onToggle={(newStatus) => handleWatchlistToggle(player._id, newStatus)}
                    />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
      )}
    </Container>
  );
};

export default WatchlistPage;
