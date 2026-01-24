import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Table, Button, Spinner, Card, Row, Col, Modal, Form, InputGroup } from 'react-bootstrap';
import apiClient, { getWatchlist } from '../services/apiClient';
import AddToWatchlistButton from './AddToWatchlistButton';
import { useAuth } from '../context/AuthContext';

const PlayerList = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [userWatchlistIds, setUserWatchlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [playersRes, watchlistData] = await Promise.allSettled([
          apiClient.get('/players'),
          getWatchlist()
        ]);

        if (playersRes.status === 'fulfilled') {
          setPlayers(playersRes.value.data);
          setFilteredPlayers(playersRes.value.data);
        } else {
          toast.error(playersRes.reason.response?.data?.message || 'Failed to fetch players.');
        }

        if (watchlistData.status === 'fulfilled') {
           setUserWatchlistIds(new Set(watchlistData.value.map(p => p._id)));
        }
      } catch (err) {
        toast.error('An unexpected error occurred while loading data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const results = players.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlayers(results);
  }, [searchTerm, players]);

  const confirmDelete = (player) => {
    setPlayerToDelete(player);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!playerToDelete) return;
    try {
      await apiClient.delete(`/players/${playerToDelete._id}`);
      const updatedPlayers = players.filter(player => player._id !== playerToDelete._id);
      setPlayers(updatedPlayers);
      setFilteredPlayers(updatedPlayers.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      toast.success('Player deleted successfully.');
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete player.');
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <div>
           <h2 className="fw-bold text-secondary mb-1">Player Management</h2>
           <p className="text-muted mb-0">Manage player profiles and details.</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
            { user && (
                <Link to="/players/new">
                    <Button variant="primary" className="shadow-sm">
                    <i className="fas fa-plus me-2"></i> Add Player
                    </Button>
                </Link>
            )}
        </div>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
             <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                    <i className="fas fa-search text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder="Search players by name or position..."
                    className="border-start-0 ps-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3 text-muted"><i className="fas fa-users-slash fa-3x"></i></div>
              <p className="text-muted">No players found.</p>
              {searchTerm && <Button variant="link" onClick={() => setSearchTerm('')}>Clear Search</Button>}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 table-borderless">
                <thead className="bg-light text-secondary border-bottom">
                  <tr>
                    <th className="ps-4 py-3 text-uppercase small fw-bold">Name</th>
                    <th className="py-3 text-uppercase small fw-bold">Position</th>
                    <th className="py-3 text-uppercase small fw-bold">Jersey</th>
                    <th className="pe-4 py-3 text-uppercase small fw-bold text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map(player => (
                    <tr key={player._id} className="border-bottom">
                      <td className="ps-4 py-3">
                          <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                                  <span className="fw-bold">{player.name.charAt(0)}</span>
                              </div>
                              <span className="fw-bold text-dark">{player.name}</span>
                          </div>
                      </td>
                      <td className="py-3"><span className="badge bg-light text-dark border">{player.position}</span></td>
                      <td className="py-3 text-muted font-monospace">#{player.jerseyNumber}</td>
                      <td className="pe-4 py-3 text-end">
                        { user && (
                            <div className="d-flex justify-content-end gap-2">
                                <AddToWatchlistButton
                                    playerId={player._id}
                                    isInitiallyWatched={userWatchlistIds.has(player._id)}
                                />
                                <Link to={`/players/edit/${player._id}`}>
                                    <Button variant="light" size="sm" className="text-secondary hover-primary" title="Edit">
                                    <i className="fas fa-edit"></i>
                                    </Button>
                                </Link>
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="text-danger hover-danger"
                                    onClick={() => confirmDelete(player)}
                                    title="Delete"
                                >
                                    <i className="fas fa-trash"></i>
                                </Button>
                            </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
           <Modal.Title className="h5 fw-bold text-danger">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p>Are you sure you want to delete player <strong>{playerToDelete?.name}</strong>?</p>
          <p className="small text-muted mb-0">This action cannot be undone and will remove all associated records.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={executeDelete}>
            <i className="fas fa-trash me-2"></i>Delete Player
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PlayerList;
