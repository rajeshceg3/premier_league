import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import AddToWatchlistButton from './AddToWatchlistButton';
import { getWatchlist } from '../services/apiClient';
import Loader from './common/Loader';
import { toast } from 'react-toastify';

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const [userWatchlistIds, setUserWatchlistIds] = useState(new Set());
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
          const watchlist = await getWatchlist();
          setUserWatchlistIds(new Set(watchlist.map(p => p._id)));
        } catch (watchlistError) {
          console.error("Failed to fetch user's watchlist", watchlistError);
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
        toast.success('Player deleted successfully');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete player.');
      }
    }
  };

  if (loading) return <Loader message="Loading players..." />;

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h2>Player Management</h2>
        </Col>
        <Col className="text-end">
          <Link to="/players/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> Add New Player
          </Link>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {players.length === 0 && !loading && (
        <Alert variant="info" className="text-center">
          No players found. Click "Add New Player" to get started.
        </Alert>
      )}

      {players.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Team</th>
              <th>Loan Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player._id}>
                <td>{player.name}</td>
                <td>{player.team?.name || 'N/A'}</td>
                <td>${player.loanCost || 0}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Link to={`/players/edit/${player._id}`} className="btn btn-sm btn-outline-secondary">
                      <i className="fas fa-edit"></i> Edit
                    </Link>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(player._id)}>
                      <i className="fas fa-trash"></i> Delete
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
      )}
    </Container>
  );
};

export default PlayerList;
