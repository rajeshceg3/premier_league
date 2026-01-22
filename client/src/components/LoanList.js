import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';
import { Table, Button, Spinner, Badge, Card, Pagination, Modal, InputGroup, Form } from 'react-bootstrap';

const LoanList = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Search State - Client side filtering for now as API might not support it
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
           <h2 className="fw-bold text-secondary mb-1">Loan Management</h2>
           <p className="text-muted mb-0">Track active and historical player loans.</p>
        </div>
        <div className="mt-3 mt-md-0">
           <Link to="/loans/new">
             <Button variant="info" className="shadow-sm text-white">
               <i className="fas fa-plus me-2"></i> Create Loan
             </Button>
           </Link>
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
                    placeholder="Search by player or team..."
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
                <Spinner animation="border" role="status" variant="info">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
             </div>
          ) : filteredLoans.length === 0 ? (
            <div className="text-center py-5">
               <div className="mb-3 text-muted"><i className="fas fa-handshake-slash fa-3x"></i></div>
              <p className="text-muted">No loans found matching your criteria.</p>
              {searchTerm && <Button variant="link" onClick={() => setSearchTerm('')}>Clear Search</Button>}
              {!searchTerm && (
                  <Link to="/loans/new">
                    <Button variant="outline-info" size="sm">Create First Loan</Button>
                  </Link>
              )}
            </div>
          ) : (
            <>
                <div className="table-responsive">
                <Table hover className="align-middle mb-0 table-borderless">
                    <thead className="bg-light text-secondary border-bottom">
                    <tr>
                        <th className="ps-4 py-3 text-uppercase small fw-bold">Player</th>
                        <th className="py-3 text-uppercase small fw-bold">Teams</th>
                        <th className="py-3 text-uppercase small fw-bold">Duration</th>
                        <th className="py-3 text-uppercase small fw-bold">Status</th>
                        <th className="pe-4 py-3 text-uppercase small fw-bold text-end">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredLoans.map(loan => (
                        <tr key={loan._id} className="border-bottom">
                        <td className="ps-4 py-3">
                            <div className="d-flex align-items-center">
                                <div className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                                    <i className="fas fa-user"></i>
                                </div>
                                <div>
                                    <div className="fw-bold text-dark">{loan.player?.name || 'Unknown'}</div>
                                    <div className="small text-muted">{loan.agent?.name ? `Agent: ${loan.agent.name}` : 'No Agent'}</div>
                                </div>
                            </div>
                        </td>
                        <td className="py-3">
                            <div className="d-flex align-items-center small">
                                <span className="fw-bold">{loan.loaningTeam?.name}</span>
                                <i className="fas fa-long-arrow-alt-right mx-2 text-muted"></i>
                                <span className="fw-bold">{loan.borrowingTeam?.name}</span>
                            </div>
                        </td>
                        <td className="py-3">
                            <div className="small text-muted">
                                <div><i className="far fa-calendar-alt me-1"></i> {new Date(loan.startDate).toLocaleDateString()}</div>
                                <div><i className="far fa-flag me-1"></i> {new Date(loan.endDate).toLocaleDateString()}</div>
                            </div>
                        </td>
                        <td className="py-3">
                            {loan.status === 'Returned' ? (
                            <Badge bg="secondary" className="px-2 py-1 fw-normal">Returned</Badge>
                            ) : (
                            <Badge bg="success" className="px-2 py-1 fw-normal">Active</Badge>
                            )}
                        </td>
                        <td className="pe-4 py-3 text-end">
                            <div className="d-flex justify-content-end gap-2">
                            <Link to={`/loans/edit/${loan._id}`}>
                                <Button variant="light" size="sm" className="text-secondary hover-primary" title="Edit">
                                <i className="fas fa-edit"></i>
                                </Button>
                            </Link>

                            {loan.status !== 'Returned' && (
                                <Button
                                variant="light"
                                size="sm"
                                className="text-warning hover-warning"
                                onClick={() => confirmReturn(loan)}
                                title="Mark as Returned"
                                >
                                <i className="fas fa-undo"></i>
                                </Button>
                            )}

                            <Button
                                variant="light"
                                size="sm"
                                className="text-danger hover-danger"
                                onClick={() => confirmDelete(loan)}
                                title="Delete"
                            >
                                <i className="fas fa-trash"></i>
                            </Button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
                </div>

                {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                        <Pagination>
                            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
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
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="h5 fw-bold text-danger">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
            <p>Are you sure you want to delete the loan for <strong>{loanToDelete?.player?.name}</strong>?</p>
            <p className="small text-muted mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={() => setShowDeleteModal(false)}>
                Cancel
            </Button>
            <Button variant="danger" onClick={executeDelete}>
                <i className="fas fa-trash me-2"></i>Delete Loan
            </Button>
        </Modal.Footer>
      </Modal>

      {/* Return Confirmation Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="h5 fw-bold text-warning">Confirm Return</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
            <p>Are you sure you want to mark the loan for <strong>{loanToReturn?.player?.name}</strong> as returned?</p>
            <p className="small text-muted mb-0">This indicates the player has returned to their parent club.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={() => setShowReturnModal(false)}>
                Cancel
            </Button>
            <Button variant="warning" onClick={executeReturn} className="text-white">
                <i className="fas fa-check me-2"></i>Confirm Return
            </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default LoanList;
