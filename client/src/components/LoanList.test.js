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

// Mock data with EMBEDDED objects as per the new implementation
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

describe('LoanList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading spinner initially', () => {
    // Setup promises that don't resolve immediately to check loading state
    apiClient.get.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <LoanList />
      </BrowserRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('renders loans after data fetch', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === '/loans') return Promise.resolve({ data: mockLoans });
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <LoanList />
      </BrowserRouter>
    );

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    // Check if data is displayed (using the names from the embedded objects)
    expect(screen.getByText('Harry Kane')).toBeInTheDocument();
    expect(screen.getByText('Spurs')).toBeInTheDocument();
    expect(screen.getByText('Bayern')).toBeInTheDocument();
    expect(screen.getByText('Charlie Kane')).toBeInTheDocument();
  });

  test('handles delete action', async () => {
     apiClient.get.mockResolvedValue({ data: mockLoans });
     apiClient.delete.mockResolvedValue({});

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    render(
      <BrowserRouter>
        <LoanList />
      </BrowserRouter>
    );

    expect(await screen.findByText('Harry Kane')).toBeInTheDocument();

    const deleteBtn = screen.getByTitle('Delete');
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(apiClient.delete).toHaveBeenCalledWith('/loans/l1');

    await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Loan deleted successfully.');
    });
  });
});
