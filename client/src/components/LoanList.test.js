import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import LoanList from './LoanList';
import apiClient from '../services/apiClient';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('../services/apiClient');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock data
const mockLoans = [
  {
    _id: 'l1',
    player: { _id: 'p1', name: 'Harry Kane' },
    loaningTeam: { _id: 't1', name: 'Spurs' },
    borrowingTeam: { _id: 't2', name: 'Bayern' },
    agent: { _id: 'a1', name: 'Charlie Kane' },
    startDate: '2023-01-01',
    endDate: '2023-06-01',
    status: 'Active'
  }
];

const mockPaginatedResponse = {
    items: mockLoans,
    totalItems: 1,
    currentPage: 1,
    totalPages: 1
};

describe('LoanList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading spinner initially', async () => {
    apiClient.get.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <LoanList />
      </BrowserRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('renders loans after data fetch', async () => {
    apiClient.get.mockResolvedValue({ data: mockPaginatedResponse });

    render(
      <BrowserRouter>
        <LoanList />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    const names = await screen.findAllByText('Harry Kane');
    expect(names.length).toBeGreaterThan(0);
  });

  test('handles delete action via Modal', async () => {
     apiClient.get.mockResolvedValue({ data: mockPaginatedResponse });
     apiClient.delete.mockResolvedValue({});

    render(
      <BrowserRouter>
        <LoanList />
      </BrowserRouter>
    );

    const names = await screen.findAllByText('Harry Kane');
    expect(names.length).toBeGreaterThan(0);

    // Click Delete button on the row (desktop view likely first, but we just need one)
    const deleteBtns = screen.getAllByTitle('Delete');
    fireEvent.click(deleteBtns[0]);

    // Modal should appear
    expect(await screen.findByText('Confirm Deletion')).toBeInTheDocument();

    // Click confirm in modal
    const confirmBtn = screen.getByText('Delete Loan');
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(apiClient.delete).toHaveBeenCalledWith('/loans/l1'));
    expect(toast.success).toHaveBeenCalledWith('Loan deleted successfully.');
  });
});
