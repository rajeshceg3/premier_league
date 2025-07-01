import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddToWatchlistButton from './AddToWatchlistButton';
import { addToWatchlist, removeFromWatchlist } from '../services/apiClient';

// Mock the apiClient module
jest.mock('../services/apiClient', () => ({
  addToWatchlist: jest.fn(),
  removeFromWatchlist: jest.fn(),
}));

describe('AddToWatchlistButton', () => {
  const playerId = 'player123';
  const onToggleMock = jest.fn();

  beforeEach(() => {
    // Clear mock history before each test
    addToWatchlist.mockClear();
    removeFromWatchlist.mockClear();
    onToggleMock.mockClear();
  });

  test('should render "Add to Watchlist" when not initially watched', () => {
    render(<AddToWatchlistButton playerId={playerId} isInitiallyWatched={false} />);
    expect(screen.getByText('Add to Watchlist')).toBeInTheDocument();
  });

  test('should render "Remove from Watchlist" when initially watched', () => {
    render(<AddToWatchlistButton playerId={playerId} isInitiallyWatched={true} />);
    expect(screen.getByText('Remove from Watchlist')).toBeInTheDocument();
  });

  test('should call addToWatchlist and change text when "Add to Watchlist" is clicked', async () => {
    addToWatchlist.mockResolvedValueOnce({}); // Simulate successful API call
    render(<AddToWatchlistButton playerId={playerId} isInitiallyWatched={false} onToggle={onToggleMock} />);

    const addButton = screen.getByText('Add to Watchlist');
    fireEvent.click(addButton);

    expect(screen.getByText('...')).toBeInTheDocument(); // Loading state
    await waitFor(() => expect(addToWatchlist).toHaveBeenCalledWith(playerId));
    await waitFor(() => expect(screen.getByText('Remove from Watchlist')).toBeInTheDocument());
    expect(onToggleMock).toHaveBeenCalledWith(true); // New state is watched: true
  });

  test('should call removeFromWatchlist and change text when "Remove from Watchlist" is clicked', async () => {
    removeFromWatchlist.mockResolvedValueOnce({}); // Simulate successful API call
    render(<AddToWatchlistButton playerId={playerId} isInitiallyWatched={true} onToggle={onToggleMock} />);

    const removeButton = screen.getByText('Remove from Watchlist');
    fireEvent.click(removeButton);

    expect(screen.getByText('...')).toBeInTheDocument(); // Loading state
    await waitFor(() => expect(removeFromWatchlist).toHaveBeenCalledWith(playerId));
    await waitFor(() => expect(screen.getByText('Add to Watchlist')).toBeInTheDocument());
    expect(onToggleMock).toHaveBeenCalledWith(false); // New state is watched: false
  });

  test('should handle API error gracefully when adding', async () => {
    addToWatchlist.mockRejectedValueOnce(new Error('API Error'));
    render(<AddToWatchlistButton playerId={playerId} isInitiallyWatched={false} onToggle={onToggleMock} />);

    const addButton = screen.getByText('Add to Watchlist');
    fireEvent.click(addButton);

    await waitFor(() => expect(addToWatchlist).toHaveBeenCalledWith(playerId));
    // Button should revert to original state or show error, here it reverts
    await waitFor(() => expect(screen.getByText('Add to Watchlist')).toBeInTheDocument());
    expect(onToggleMock).not.toHaveBeenCalled();
  });

  test('should handle API error gracefully when removing', async () => {
    removeFromWatchlist.mockRejectedValueOnce(new Error('API Error'));
    render(<AddToWatchlistButton playerId={playerId} isInitiallyWatched={true} onToggle={onToggleMock} />);

    const removeButton = screen.getByText('Remove from Watchlist');
    fireEvent.click(removeButton);

    await waitFor(() => expect(removeFromWatchlist).toHaveBeenCalledWith(playerId));
    await waitFor(() => expect(screen.getByText('Remove from Watchlist')).toBeInTheDocument());
    expect(onToggleMock).not.toHaveBeenCalled();
  });

   test('should show loading state and be disabled during API call', async () => {
    // Use a promise that doesn't resolve immediately to check loading state
    const slowPromise = new Promise(resolve => setTimeout(() => resolve({}), 100));
    addToWatchlist.mockReturnValueOnce(slowPromise);

    render(<AddToWatchlistButton playerId={playerId} isInitiallyWatched={false} />);
    const button = screen.getByText('Add to Watchlist');
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText('...')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Remove from Watchlist')).toBeInTheDocument());
    expect(button).not.toBeDisabled();
  });
});
