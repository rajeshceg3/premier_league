import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient, { getWatchlist } from '../services/apiClient';
import AddToWatchlistButton from './AddToWatchlistButton';
import { toast } from 'react-toastify';
import { Container, Table, Button, Spinner, Card, Row, Col } from 'react-bootstrap';

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const [userWatchlistIds, setUserWatchlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch players
        const playersRes = await apiClient.get('/players');
        setPlayers(playersRes.data);

        // Fetch user's watchlist (silent fail allowed)
        try {
          const watchlist = await getWatchlist();
          setUserWatchlistIds(new Set(watchlist.map(p => p._id)));
        } catch (watchlistError) {
          console.error("Failed to fetch user's watchlist", watchlistError);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch players.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await apiClient.delete(`/players/${id}`);
        setPlayers(players.filter(player => player._id !== id));
        toast.success('Player deleted successfully.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete player.');
      }
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>Player Management</h2>
        </Col>
        <Col className="text-end">
           <Link to="/players/new">
             <Button variant="primary">
               <i className="fas fa-plus"></i> Add New Player
             </Button>
           </Link>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          {players.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No players found.</p>
              <Link to="/players/new">
                <Button variant="outline-primary" size="sm">Register First Player</Button>
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover striped bordered className="align-middle">
                <thead className="table-light">
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
                      <td className="fw-bold">{player.name}</td>
                      <td>{player.position}</td>
                      <td>{player.jerseyNumber}</td>
                      <td>
                        <div className="d-flex gap-2 align-items-center">
                          <Link to={`/players/edit/${player._id}`}>
                            <Button variant="outline-primary" size="sm" title="Edit">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </Link>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(player._id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>

                          <AddToWatchlistButton
                            playerId={player._id}
                            isInitiallyWatched={userWatchlistIds.has(player._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PlayerList;
