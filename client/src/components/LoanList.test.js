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
    player: 'p1',
    loaningTeam: 't1',
    borrowingTeam: 't2',
    agent: 'a1',
    startDate: '2023-01-01',
    endDate: '2023-06-01',
    status: 'Active'
  }
];

const mockPlayers = [{ _id: 'p1', name: 'Harry Kane' }];
const mockTeams = [{ _id: 't1', name: 'Spurs' }, { _id: 't2', name: 'Bayern' }];
const mockAgents = [{ _id: 'a1', name: 'Charlie Kane' }];

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
      if (url === '/players') return Promise.resolve({ data: mockPlayers });
      if (url === '/teams') return Promise.resolve({ data: mockTeams });
      if (url === '/agents') return Promise.resolve({ data: mockAgents });
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <LoanList />
      </BrowserRouter>
    );

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    // Check if data is displayed (using the names from the maps)
    expect(screen.getByText('Harry Kane')).toBeInTheDocument();
    expect(screen.getByText('Spurs')).toBeInTheDocument();
    expect(screen.getByText('Bayern')).toBeInTheDocument();
    expect(screen.getByText('Charlie Kane')).toBeInTheDocument();
  });

  test('handles delete action', async () => {
     apiClient.get.mockResolvedValue({ data: [] }); // Default for others
     apiClient.get.mockImplementation((url) => {
      if (url === '/loans') return Promise.resolve({ data: mockLoans });
      if (url === '/players') return Promise.resolve({ data: mockPlayers });
      if (url === '/teams') return Promise.resolve({ data: mockTeams });
      if (url === '/agents') return Promise.resolve({ data: mockAgents });
      return Promise.resolve({ data: [] });
    });

    apiClient.delete.mockResolvedValue({});

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    render(
      <BrowserRouter>
        <LoanList />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText('Harry Kane')).toBeInTheDocument());

    const deleteBtn = screen.getByTitle('Delete');
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(apiClient.delete).toHaveBeenCalledWith('/loans/l1');

    await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Loan deleted successfully.');
    });
  });
});
