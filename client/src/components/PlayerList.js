import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Table, Button, Spinner, Card, Row, Col, Modal } from 'react-bootstrap';
import apiClient, { getWatchlist } from '../services/apiClient';
import AddToWatchlistButton from './AddToWatchlistButton';

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const [userWatchlistIds, setUserWatchlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch players and watchlist in parallel
        const [playersRes, watchlistData] = await Promise.allSettled([
          apiClient.get('/players'),
          getWatchlist()
        ]);

        // Handle Players Response
        if (playersRes.status === 'fulfilled') {
          setPlayers(playersRes.value.data);
        } else {
          console.error("Failed to fetch players", playersRes.reason);
          toast.error(playersRes.reason.response?.data?.message || 'Failed to fetch players.');
        }

        // Handle Watchlist Response
        if (watchlistData.status === 'fulfilled') {
           setUserWatchlistIds(new Set(watchlistData.value.map(p => p._id)));
        } else {
           console.error("Failed to fetch watchlist", watchlistData.reason);
           // Silent fail for watchlist is acceptable, but logging is good.
        }

      } catch (err) {
        // Should not happen with Promise.allSettled unless something catastrophic
        console.error("Unexpected error in fetchData", err);
        toast.error('An unexpected error occurred while loading data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const confirmDelete = (player) => {
    setPlayerToDelete(player);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!playerToDelete) return;
    try {
      await apiClient.delete(`/players/${playerToDelete._id}`);
      setPlayers(players.filter(player => player._id !== playerToDelete._id));
      toast.success('Player deleted successfully.');
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete player.');
    }
  };

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
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No players found.</p>
              <Link to="/players/new">
                <Button variant="outline-primary" size="sm">Create First Player</Button>
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
                        <div className="d-flex gap-2">
                          <Link to={`/players/edit/${player._id}`}>
                            <Button variant="outline-primary" size="sm" title="Edit">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </Link>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => confirmDelete(player)}
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete player <strong>{playerToDelete?.name}</strong>?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={executeDelete}>
            Delete Player
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default PlayerList;
