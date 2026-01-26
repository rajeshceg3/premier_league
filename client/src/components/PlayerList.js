import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Table, Button, Card, Modal, InputGroup, Form, Row, Col } from 'react-bootstrap';
import apiClient, { getWatchlist } from '../services/apiClient';
import AddToWatchlistButton from './AddToWatchlistButton';
import { useAuth } from '../context/AuthContext';
import Skeleton from './common/Skeleton';

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
           <h2 className="fw-bold text-dark mb-1">Player Management</h2>
           <p className="text-muted mb-0">Manage player profiles and details.</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
            { user && (
                <Link to="/players/new">
                    <Button variant="primary" className="shadow-sm hover-lift rounded-pill px-4">
                    <i className="fas fa-plus me-2"></i> Add Player
                    </Button>
                </Link>
            )}
        </div>
      </div>

      <Card className="border-0 shadow-sm mb-4 glass-panel">
        <Card.Body className="p-3">
             <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0">
                    <i className="fas fa-search text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder="Search players by name or position..."
                    className="border-start-0 ps-0 bg-transparent shadow-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>
        </Card.Body>
      </Card>

      {loading ? (
        <>
            {/* Desktop Skeleton */}
            <div className="d-none d-md-block">
                <Card className="border-0 shadow-sm overflow-hidden">
                    <div className="p-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="d-flex align-items-center mb-4">
                                <Skeleton type="circle" width="40px" height="40px" className="me-3" />
                                <div style={{width: '30%'}} className="me-4">
                                    <Skeleton width="60%" height="1rem" className="mb-1" />
                                    <Skeleton width="40%" height="0.8rem" />
                                </div>
                                <div style={{width: '20%'}} className="me-4"><Skeleton width="100px" height="1.5rem" className="rounded-pill" /></div>
                                <div style={{width: '10%'}} className="me-auto"><Skeleton width="40px" height="1rem" /></div>
                                <div style={{width: '15%'}}><Skeleton width="100%" height="2rem" /></div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            {/* Mobile Skeleton */}
            <div className="d-md-none">
                <Row className="g-3">
                    {[...Array(4)].map((_, i) => (
                        <Col xs={12} key={i}>
                            <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                                <Card.Body className="p-4">
                                    <div className="d-flex mb-3">
                                        <Skeleton type="circle" width="48px" height="48px" className="me-3" />
                                        <div className="flex-grow-1">
                                            <Skeleton width="50%" height="1.2rem" className="mb-2" />
                                            <Skeleton width="30%" height="0.9rem" />
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Skeleton width="100%" height="2.5rem" />
                                        <Skeleton width="100%" height="2.5rem" />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </>
      ) : filteredPlayers.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
                <div className="mb-3 text-muted opacity-50"><i className="fas fa-users-slash fa-4x"></i></div>
                <h5 className="fw-bold text-dark">No Players Found</h5>
                <p className="text-muted">No players match your search criteria.</p>
                {searchTerm && <Button variant="link" onClick={() => setSearchTerm('')}>Clear Search</Button>}
            </Card.Body>
        </Card>
      ) : (
        <>
            {/* Desktop View (Table) */}
            <div className="d-none d-md-block">
                <Card className="border-0 shadow-sm overflow-hidden">
                    <Table hover className="align-middle mb-0 table-borderless">
                        <thead className="bg-light text-secondary border-bottom">
                        <tr>
                            <th className="ps-4 py-3 text-uppercase small fw-bold tracking-wide">Name</th>
                            <th className="py-3 text-uppercase small fw-bold tracking-wide">Position</th>
                            <th className="py-3 text-uppercase small fw-bold tracking-wide">Jersey</th>
                            <th className="pe-4 py-3 text-uppercase small fw-bold tracking-wide text-end">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredPlayers.map(player => (
                            <tr key={player._id} className="border-bottom hover-lift-sm transition-colors cursor-default">
                            <td className="ps-4 py-3">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary-100 text-primary rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm ring-4 ring-white" style={{width: '40px', height: '40px'}}>
                                        <span className="fw-bold">{player.name.charAt(0)}</span>
                                    </div>
                                    <span className="fw-bold text-dark">{player.name}</span>
                                </div>
                            </td>
                            <td className="py-3"><span className="badge bg-light text-dark border shadow-sm rounded-pill px-3 fw-normal">{player.position}</span></td>
                            <td className="py-3 text-muted font-monospace">#{player.jerseyNumber}</td>
                            <td className="pe-4 py-3 text-end">
                                { user && (
                                    <div className="d-flex justify-content-end gap-2 opacity-0 group-hover-opacity-100 transition-opacity" style={{opacity: 0.8}}>
                                        <AddToWatchlistButton
                                            playerId={player._id}
                                            isInitiallyWatched={userWatchlistIds.has(player._id)}
                                        />
                                        <Link to={`/players/edit/${player._id}`}>
                                            <Button variant="light" size="sm" className="btn-icon rounded-circle shadow-sm hover-scale" title="Edit">
                                            <i className="fas fa-pencil-alt text-secondary"></i>
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="btn-icon rounded-circle shadow-sm hover-scale"
                                            onClick={() => confirmDelete(player)}
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash-alt text-danger"></i>
                                        </Button>
                                    </div>
                                )}
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Card>
            </div>

            {/* Mobile View (Cards) */}
            <div className="d-md-none">
                <Row className="g-3">
                    {filteredPlayers.map(player => (
                        <Col xs={12} key={player._id}>
                            <Card className="card-slick rounded-xl overflow-hidden border-0">
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-md"
                                                 style={{width: '52px', height: '52px', background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))'}}>
                                                <span className="fw-bold fs-5">{player.name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark fs-5 lh-1 mb-1">{player.name}</div>
                                                <span className="badge bg-light text-secondary border rounded-pill fw-normal">{player.position}</span>
                                            </div>
                                        </div>
                                        <div className="fs-2 fw-bold text-light opacity-25 font-monospace">
                                            #{player.jerseyNumber}
                                        </div>
                                    </div>

                                    { user && (
                                        <div className="d-grid gap-2 d-flex justify-content-end pt-3 border-top mt-2">
                                            <div className="flex-grow-1">
                                                {/* Wrapper to make the button full width if needed, or check button styling */}
                                                <AddToWatchlistButton
                                                    playerId={player._id}
                                                    isInitiallyWatched={userWatchlistIds.has(player._id)}
                                                />
                                            </div>
                                            <Link to={`/players/edit/${player._id}`} className="flex-grow-1">
                                                <Button variant="light" className="w-100 fw-bold text-secondary border-0 bg-slate-50"><i className="fas fa-pencil-alt me-2"></i>Edit</Button>
                                            </Link>
                                            <Button variant="light" className="flex-grow-0 text-danger border-0 bg-slate-50" onClick={() => confirmDelete(player)}>
                                                <i className="fas fa-trash-alt"></i>
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </>
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static" contentClassName="border-0 shadow-lg rounded-2xl">
        <Modal.Header closeButton className="border-0 pb-0">
           <Modal.Title className="h5 fw-bold text-danger">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p>Are you sure you want to delete player <strong>{playerToDelete?.name}</strong>?</p>
          <p className="small text-muted mb-0">This action cannot be undone and will remove all associated records.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-3 pe-4">
          <Button variant="light" onClick={() => setShowDeleteModal(false)} className="rounded-pill px-4">
            Cancel
          </Button>
          <Button variant="danger" onClick={executeDelete} className="rounded-pill px-4 shadow-sm">
            <i className="fas fa-trash me-2"></i>Delete Player
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PlayerList;
