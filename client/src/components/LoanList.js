import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';
import { Table, Button, Spinner, Badge, Card, Pagination, Modal, InputGroup, Form, Row, Col } from 'react-bootstrap';

const LoanList = () => {
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
           <Link to="/loans/new">
             <Button variant="info" className="shadow-sm text-white rounded-pill px-4">
               <i className="fas fa-plus me-2"></i> Create Loan
             </Button>
           </Link>
        </div>
      </div>

       <Card className="border-0 shadow-sm mb-4 glass-panel">
        <Card.Body className="p-3">
             <InputGroup>
                <InputGroup.Text className="bg-white border-end-0 text-muted ps-3">
                    <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder="Search by player or team..."
                    className="border-start-0 ps-2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>
        </Card.Body>
      </Card>

      {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
      ) : filteredLoans.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
           <Card.Body>
              <div className="mb-3 text-muted opacity-50"><i className="fas fa-handshake-slash fa-4x"></i></div>
              <h5 className="fw-bold text-dark">No Loans Found</h5>
              <p className="text-muted">No loans match your search criteria.</p>
              {searchTerm && <Button variant="link" onClick={() => setSearchTerm('')}>Clear Search</Button>}
              {!searchTerm && (
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
                            <tr key={loan._id} className="border-bottom hover-bg-slate-50 transition-colors">
                            <td className="ps-4 py-3">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary-100 text-primary rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{width: '40px', height: '40px'}}>
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
                                    <i className="fas fa-arrow-right mx-2 text-muted opacity-50"></i>
                                    <span className="fw-bold text-dark">{loan.borrowingTeam?.name}</span>
                                </div>
                            </td>
                            <td className="py-3">
                                <div className="small text-muted">
                                    <div><i className="far fa-calendar-check me-1 w-4 text-center"></i> {new Date(loan.startDate).toLocaleDateString()}</div>
                                    <div><i className="far fa-calendar-times me-1 w-4 text-center"></i> {new Date(loan.endDate).toLocaleDateString()}</div>
                                </div>
                            </td>
                            <td className="py-3">
                                {loan.status === 'Returned' ? (
                                <Badge bg="secondary" className="px-2 py-1 fw-normal bg-opacity-10 text-secondary border border-secondary border-opacity-25">Returned</Badge>
                                ) : (
                                <Badge bg="success" className="px-2 py-1 fw-normal bg-opacity-10 text-success border border-success border-opacity-25">Active</Badge>
                                )}
                            </td>
                            <td className="pe-4 py-3 text-end">
                                <div className="d-flex justify-content-end gap-2 opacity-75 hover-opacity-100">
                                <Link to={`/loans/edit/${loan._id}`}>
                                    <Button variant="light" size="sm" className="btn-icon rounded-circle shadow-sm" title="Edit">
                                    <i className="fas fa-pencil-alt text-secondary"></i>
                                    </Button>
                                </Link>

                                {loan.status !== 'Returned' && (
                                    <Button
                                    variant="light"
                                    size="sm"
                                    className="btn-icon rounded-circle shadow-sm"
                                    onClick={() => confirmReturn(loan)}
                                    title="Mark as Returned"
                                    >
                                    <i className="fas fa-undo text-warning"></i>
                                    </Button>
                                )}

                                <Button
                                    variant="light"
                                    size="sm"
                                    className="btn-icon rounded-circle shadow-sm"
                                    onClick={() => confirmDelete(loan)}
                                    title="Delete"
                                >
                                    <i className="fas fa-trash-alt text-danger"></i>
                                </Button>
                                </div>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Card>
            </div>

            {/* Mobile Card View */}
            <div className="d-md-none">
                {filteredLoans.map(loan => (
                    <Card key={loan._id} className="mb-3 border-0 shadow-sm rounded-xl overflow-hidden">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary-100 text-primary rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{width: '48px', height: '48px'}}>
                                        <span className="fw-bold fs-5">{loan.player?.name?.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <div className="fw-bold text-dark fs-5">{loan.player?.name}</div>
                                        <div className="small text-muted">{loan.agent?.name || 'No Agent'}</div>
                                    </div>
                                </div>
                                <div>
                                    {loan.status === 'Returned' ? (
                                        <Badge bg="secondary" className="px-2 py-1 fw-normal bg-opacity-10 text-secondary border border-secondary border-opacity-25">Returned</Badge>
                                    ) : (
                                        <Badge bg="success" className="px-2 py-1 fw-normal bg-opacity-10 text-success border border-success border-opacity-25">Active</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded p-3 mb-3">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <span className="small text-muted fw-bold text-uppercase">From</span>
                                    <span className="fw-bold text-dark">{loan.loaningTeam?.name}</span>
                                </div>
                                <div className="d-flex align-items-center justify-content-center my-1 text-muted opacity-25">
                                    <i className="fas fa-arrow-down"></i>
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <span className="small text-muted fw-bold text-uppercase">To</span>
                                    <span className="fw-bold text-dark">{loan.borrowingTeam?.name}</span>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between mb-4 small text-muted">
                                <div><i className="far fa-calendar-check me-2"></i>{new Date(loan.startDate).toLocaleDateString()}</div>
                                <div><i className="far fa-calendar-times me-2"></i>{new Date(loan.endDate).toLocaleDateString()}</div>
                            </div>

                            <div className="d-grid gap-2 d-flex justify-content-end">
                                <Link to={`/loans/edit/${loan._id}`} className="flex-grow-1">
                                    <Button variant="light" className="w-100 border">Edit</Button>
                                </Link>
                                {loan.status !== 'Returned' && (
                                    <Button variant="warning" className="text-white flex-grow-1" onClick={() => confirmReturn(loan)}>Return</Button>
                                )}
                                <Button variant="outline-danger" className="flex-grow-0" onClick={() => confirmDelete(loan)}>
                                    <i className="fas fa-trash-alt"></i>
                                </Button>
                            </div>
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
