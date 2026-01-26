import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';
import { Table, Button, Badge, Card, Pagination, Modal, InputGroup, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import Skeleton from './common/Skeleton';

const LoanList = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState(null);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [loanToReturn, setLoanToReturn] = useState(null);

  const fetchLoans = async (page) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/loans?page=${page}&limit=${pageSize}`);
      if (Array.isArray(data)) {
         setLoans(data);
         setTotalPages(1);
         setTotalItems(data.length);
      } else {
         setLoans(data.items);
         setTotalPages(data.totalPages);
         setTotalItems(data.totalItems);
         setCurrentPage(data.currentPage);
      }
    } catch (err) {
      console.error("Error fetching loan data", err);
      toast.error(err.response?.data?.message || 'Failed to fetch loans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Delete Handlers
  const confirmDelete = (loan) => {
    setLoanToDelete(loan);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!loanToDelete) return;
    try {
      await apiClient.delete(`/loans/${loanToDelete._id}`);
      setLoans(loans.filter(loan => loan._id !== loanToDelete._id));
      toast.success('Loan deleted successfully.');
      setShowDeleteModal(false);
      // Refetch logic
      if (loans.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
      } else {
          fetchLoans(currentPage);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete loan.');
    }
  };

  // Return Handlers
  const confirmReturn = (loan) => {
    setLoanToReturn(loan);
    setShowReturnModal(true);
  };

  const executeReturn = async () => {
      if (!loanToReturn) return;
      try {
        const res = await apiClient.post(`/returns/${loanToReturn._id}/return`);
        setLoans(loans.map(loan =>
          loan._id === loanToReturn._id
            ? { ...loan, status: 'Returned', returnedDate: res.data.returnedDate || new Date().toISOString() }
            : loan
        ));
        toast.success('Loan marked as returned.');
        setShowReturnModal(false);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to mark loan as returned.');
      }
  };

  // Filter loans based on search term
  const filteredLoans = loans.filter(loan =>
      loan.player?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loaningTeam?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrowingTeam?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
       <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <div>
           <h1 className="h2 fw-bold text-dark mb-1">Loan Management</h1>
           <p className="text-muted mb-0">Track active and historical player loans.</p>
        </div>
        <div className="mt-3 mt-md-0">
           { user && (
                <Link to="/loans/new">
                    <Button variant="info" className="shadow-sm text-white rounded-pill px-4 hover-lift">
                    <i className="fas fa-plus me-2"></i> Create Loan
                    </Button>
                </Link>
           )}
        </div>
      </div>

       <Card className="border-0 shadow-sm mb-4 glass-panel">
        <Card.Body className="p-3">
             <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0 text-muted ps-3">
                    <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder="Search by player or team..."
                    className="border-start-0 ps-2 bg-transparent shadow-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>
        </Card.Body>
      </Card>

      {loading ? (
        <div role="status" aria-label="Loading loans">
           {/* Desktop Loading Skeleton */}
           <div className="d-none d-md-block">
               <Card className="border-0 shadow-sm overflow-hidden">
                   <div className="p-4">
                      {[...Array(5)].map((_, i) => (
                          <div key={i} className="d-flex align-items-center mb-4">
                              <Skeleton type="circle" width="40px" height="40px" className="me-3" />
                              <div className="flex-grow-1 d-flex justify-content-between align-items-center">
                                  <div style={{width: '25%'}}>
                                      <Skeleton width="80%" height="1rem" className="mb-1"/>
                                      <Skeleton width="50%" height="0.8rem" />
                                  </div>
                                  <div style={{width: '25%'}}><Skeleton width="90%" height="1rem" /></div>
                                  <div style={{width: '20%'}}><Skeleton width="70%" height="1rem" /></div>
                                  <div style={{width: '10%'}}><Skeleton width="100%" height="2rem" /></div>
                              </div>
                          </div>
                      ))}
                   </div>
               </Card>
           </div>
           {/* Mobile Loading Skeleton */}
           <div className="d-md-none">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="mb-3 border-0 shadow-sm rounded-xl overflow-hidden">
                        <Card.Body className="p-4">
                            <div className="d-flex mb-3">
                                <Skeleton type="circle" width="48px" height="48px" className="me-3" />
                                <div className="flex-grow-1">
                                    <Skeleton width="60%" height="1.2rem" className="mb-2" />
                                    <Skeleton width="40%" height="0.9rem" />
                                </div>
                            </div>
                            <Skeleton width="100%" height="40px" className="mb-3" />
                            <div className="d-flex justify-content-between">
                                <Skeleton width="30%" height="2rem" />
                                <Skeleton width="30%" height="2rem" />
                            </div>
                        </Card.Body>
                    </Card>
                ))}
           </div>
        </div>
      ) : filteredLoans.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
           <Card.Body>
              <div className="mb-3 text-muted opacity-50"><i className="fas fa-handshake-slash fa-4x"></i></div>
              <h5 className="fw-bold text-dark">No Loans Found</h5>
              <p className="text-muted">No loans match your search criteria.</p>
              {searchTerm && <Button variant="link" onClick={() => setSearchTerm('')}>Clear Search</Button>}
              {!searchTerm && user && (
                  <Link to="/loans/new">
                    <Button variant="outline-primary" size="sm">Create First Loan</Button>
                  </Link>
              )}
           </Card.Body>
        </Card>
      ) : (
        <>
            {/* Desktop Table View */}
            <div className="d-none d-md-block">
                <Card className="border-0 shadow-sm overflow-hidden">
                    <Table hover className="align-middle mb-0 table-borderless">
                        <thead className="bg-light text-secondary border-bottom">
                        <tr>
                            <th className="ps-4 py-3 text-uppercase small fw-bold tracking-wide">Player</th>
                            <th className="py-3 text-uppercase small fw-bold tracking-wide">Teams</th>
                            <th className="py-3 text-uppercase small fw-bold tracking-wide">Duration</th>
                            <th className="py-3 text-uppercase small fw-bold tracking-wide">Status</th>
                            <th className="pe-4 py-3 text-uppercase small fw-bold tracking-wide text-end">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredLoans.map(loan => (
                            <tr key={loan._id} className="border-bottom hover-lift-sm transition-colors cursor-default">
                            <td className="ps-4 py-3">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary-100 text-primary rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm ring-4 ring-white" style={{width: '40px', height: '40px'}}>
                                        <span className="fw-bold">{loan.player?.name?.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <div className="fw-bold text-dark">{loan.player?.name || 'Unknown'}</div>
                                        <div className="small text-muted">{loan.agent?.name ? `Agent: ${loan.agent.name}` : 'No Agent'}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-3">
                                <div className="d-flex align-items-center small">
                                    <span className="fw-bold text-dark">{loan.loaningTeam?.name}</span>
                                    <i className="fas fa-arrow-right mx-2 text-primary opacity-50"></i>
                                    <span className="fw-bold text-dark">{loan.borrowingTeam?.name}</span>
                                </div>
                            </td>
                            <td className="py-3">
                                <div className="small text-muted">
                                    <div><i className="far fa-calendar-check me-1 w-4 text-center text-success"></i> {new Date(loan.startDate).toLocaleDateString()}</div>
                                    <div><i className="far fa-calendar-times me-1 w-4 text-center text-danger"></i> {new Date(loan.endDate).toLocaleDateString()}</div>
                                </div>
                            </td>
                            <td className="py-3">
                                {loan.status === 'Returned' ? (
                                <Badge bg="secondary" className="px-2 py-1 fw-normal bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill">Returned</Badge>
                                ) : (
                                <Badge bg="success" className="px-2 py-1 fw-normal bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill">
                                   <i className="fas fa-circle small me-1" style={{fontSize: '0.5em'}}></i>Active
                                </Badge>
                                )}
                            </td>
                            <td className="pe-4 py-3 text-end">
                                { user && (
                                    <div className="d-flex justify-content-end gap-2 opacity-0 group-hover-opacity-100 transition-opacity" style={{opacity: 0.8}}>
                                        <Link to={`/loans/edit/${loan._id}`}>
                                            <Button variant="light" size="sm" className="btn-icon rounded-circle shadow-sm hover-scale" title="Edit">
                                            <i className="fas fa-pencil-alt text-secondary"></i>
                                            </Button>
                                        </Link>

                                        {loan.status !== 'Returned' && (
                                            <Button
                                            variant="light"
                                            size="sm"
                                            className="btn-icon rounded-circle shadow-sm hover-scale"
                                            onClick={() => confirmReturn(loan)}
                                            title="Mark as Returned"
                                            >
                                            <i className="fas fa-undo text-warning"></i>
                                            </Button>
                                        )}

                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="btn-icon rounded-circle shadow-sm hover-scale"
                                            onClick={() => confirmDelete(loan)}
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

            {/* Mobile Card View (Slick) */}
            <div className="d-md-none">
                {filteredLoans.map(loan => (
                    <Card key={loan._id} className="mb-3 card-slick rounded-xl overflow-hidden border-0">
                        <div className={`position-absolute top-0 bottom-0 start-0 ${loan.status === 'Returned' ? 'bg-secondary' : 'bg-success'}`} style={{width: '6px'}}></div>
                        <Card.Body className="p-4 ps-4">
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div className="d-flex align-items-center">
                                    <div className="bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-md"
                                         style={{width: '52px', height: '52px', background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))'}}>
                                        <span className="fw-bold fs-5">{loan.player?.name?.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <div className="fw-bold text-dark fs-5 lh-1 mb-1">{loan.player?.name}</div>
                                        <div className="small text-muted">{loan.agent?.name || 'No Agent'}</div>
                                    </div>
                                </div>
                                <div>
                                     {loan.status === 'Returned' ? (
                                        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-20 rounded-pill px-3 py-2">Returned</span>
                                    ) : (
                                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 rounded-pill px-3 py-2">Active</span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100">
                                <div className="row g-0 align-items-center text-center">
                                    <div className="col text-start">
                                        <div className="small text-muted text-uppercase tracking-wide" style={{fontSize: '0.65rem'}}>From</div>
                                        <div className="fw-bold text-dark small">{loan.loaningTeam?.name}</div>
                                    </div>
                                    <div className="col-auto px-3 text-muted opacity-25">
                                        <i className="fas fa-arrow-right"></i>
                                    </div>
                                    <div className="col text-end">
                                        <div className="small text-muted text-uppercase tracking-wide" style={{fontSize: '0.65rem'}}>To</div>
                                        <div className="fw-bold text-dark small">{loan.borrowingTeam?.name}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between mb-4 small text-muted px-1">
                                <div><i className="far fa-calendar-check me-2 text-success"></i>{new Date(loan.startDate).toLocaleDateString()}</div>
                                <div><i className="far fa-calendar-times me-2 text-danger"></i>{new Date(loan.endDate).toLocaleDateString()}</div>
                            </div>

                            { user && (
                                <div className="d-flex gap-2 border-top pt-3 mt-2">
                                    <Link to={`/loans/edit/${loan._id}`} className="flex-grow-1">
                                        <Button variant="light" className="w-100 text-secondary fw-bold small"><i className="fas fa-pencil-alt me-2"></i>Edit</Button>
                                    </Link>
                                    {loan.status !== 'Returned' && (
                                        <Button variant="light" className="flex-grow-1 text-warning fw-bold small" onClick={() => confirmReturn(loan)}>
                                            <i className="fas fa-undo me-2"></i>Return
                                        </Button>
                                    )}
                                    <Button variant="light" className="flex-grow-0 text-danger" onClick={() => confirmDelete(loan)}>
                                        <i className="fas fa-trash-alt"></i>
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination className="shadow-sm rounded-pill bg-white p-1">
                        <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="rounded-circle" />
                        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                        {[...Array(totalPages).keys()].map(page => (
                            <Pagination.Item
                                key={page + 1}
                                active={page + 1 === currentPage}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                {page + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                </div>
            )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static" contentClassName="border-0 shadow-lg rounded-2xl">
        <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="h5 fw-bold text-danger">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
            <p>Are you sure you want to delete the loan for <strong>{loanToDelete?.player?.name}</strong>?</p>
            <p className="small text-muted mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-3 pe-4">
            <Button variant="light" onClick={() => setShowDeleteModal(false)} className="rounded-pill px-4">
                Cancel
            </Button>
            <Button variant="danger" onClick={executeDelete} className="rounded-pill px-4 shadow-sm">
                <i className="fas fa-trash me-2"></i>Delete Loan
            </Button>
        </Modal.Footer>
      </Modal>

      {/* Return Confirmation Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} centered backdrop="static" contentClassName="border-0 shadow-lg rounded-2xl">
        <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="h5 fw-bold text-warning">Confirm Return</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
            <p>Are you sure you want to mark the loan for <strong>{loanToReturn?.player?.name}</strong> as returned?</p>
            <p className="small text-muted mb-0">This indicates the player has returned to their parent club.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-3 pe-4">
            <Button variant="light" onClick={() => setShowReturnModal(false)} className="rounded-pill px-4">
                Cancel
            </Button>
            <Button variant="warning" onClick={executeReturn} className="text-white rounded-pill px-4 shadow-sm">
                <i className="fas fa-check me-2"></i>Confirm Return
            </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default LoanList;
