import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';
import { Container, Table, Button, Spinner, Badge, Card, Row, Col, Pagination, Modal } from 'react-bootstrap';

const LoanList = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState(null);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [loanToReturn, setLoanToReturn] = useState(null);

  const fetchLoans = async (page) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/loans?page=${page}&limit=${pageSize}`);
      // Handle both legacy (array) and new (object) API responses for robustness
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
      // Refetch if page becomes empty? For now just remove from list.
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

        // Update local state without refetching everything for better UX
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

  return (
    <Container className="mt-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>Loan Management</h2>
          <p className="text-muted small mb-0">Total Active/History: {totalItems}</p>
        </Col>
        <Col className="text-end">
           <Link to="/loans/new">
             <Button variant="primary">
               <i className="fas fa-plus"></i> Add New Loan
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
          ) : loans.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No loans found on file.</p>
              <Link to="/loans/new">
                <Button variant="outline-primary" size="sm">Create First Loan</Button>
              </Link>
            </div>
          ) : (
            <>
                <div className="table-responsive">
                <Table hover striped bordered className="align-middle">
                    <thead className="table-light">
                    <tr>
                        <th>Player</th>
                        <th>From (Loaning)</th>
                        <th>To (Borrowing)</th>
                        <th>Agent</th>
                        <th>Dates</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loans.map(loan => (
                        <tr key={loan._id}>
                        <td className="fw-bold">{loan.player?.name || 'Unknown Player'}</td>
                        <td>{loan.loaningTeam?.name || 'Unknown Team'}</td>
                        <td>{loan.borrowingTeam?.name || 'Unknown Team'}</td>
                        <td>{loan.agent?.name || <span className="text-muted">None</span>}</td>
                        <td>
                            <div className="small">
                            <div><span className="text-muted">Start:</span> {new Date(loan.startDate).toLocaleDateString()}</div>
                            <div><span className="text-muted">End:</span> {new Date(loan.endDate).toLocaleDateString()}</div>
                            </div>
                        </td>
                        <td>
                            {loan.status === 'Returned' ? (
                            <Badge bg="secondary">Returned</Badge>
                            ) : (
                            <Badge bg="success">Active</Badge>
                            )}
                        </td>
                        <td>
                            <div className="d-flex gap-2">
                            <Link to={`/loans/edit/${loan._id}`}>
                                <Button variant="outline-primary" size="sm" title="Edit">
                                <i className="fas fa-edit"></i>
                                </Button>
                            </Link>

                            {loan.status !== 'Returned' && (
                                <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => confirmReturn(loan)}
                                title="Mark as Returned"
                                >
                                <i className="fas fa-undo"></i>
                                </Button>
                            )}

                            <Button
                                variant="outline-danger"
                                size="sm"
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
                    <div className="d-flex justify-content-center mt-3">
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
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Are you sure you want to delete the loan for <strong>{loanToDelete?.player?.name}</strong>?
            This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
            </Button>
            <Button variant="danger" onClick={executeDelete}>
                Delete Loan
            </Button>
        </Modal.Footer>
      </Modal>

      {/* Return Confirmation Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} centered>
        <Modal.Header closeButton>
            <Modal.Title>Confirm Return</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Are you sure you want to mark the loan for <strong>{loanToReturn?.player?.name}</strong> as returned?
            This will calculate the final fee.
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReturnModal(false)}>
                Cancel
            </Button>
            <Button variant="warning" onClick={executeReturn}>
                Mark as Returned
            </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default LoanList;
