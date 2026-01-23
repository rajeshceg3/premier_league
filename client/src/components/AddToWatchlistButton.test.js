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

  test('should render "Watch" when not initially watched', () => {
    render(<AddToWatchlistButton playerId={playerId} isInitiallyWatched={false} />);
    expect(screen.getByText('Watch')).toBeInTheDocument();
  });

  test('should render "Unwatch" when initially watched', () => {
    render(<AddToWatchlistButton playerId={playerId} isInitiallyWatched={true} />);
    expect(screen.getByText('Unwatch')).toBeInTheDocument();
  });

  test('should call addToWatchlist and change text when "Watch" is clicked', async () => {
    addToWatchlist.mockResolvedValueOnce({}); // Simulate successful API call
    render(<AddToWatchlistButton playerId={playerId} isInitiallyWatched={false} onToggle={onToggleMock} />);

    const addButton = screen.getByText('Watch');
    fireEvent.click(addButton);

    // Check for loading spinner
    expect(screen.getByRole('button')).toBeDisabled();

    await waitFor(() => expect(addToWatchlist).toHaveBeenCalledWith(playerId));
    await screen.findByText('Unwatch');
    expect(onToggleMock).toHaveBeenCalledWith(true); // New state is watched: true
  });

  test('should call removeFromWatchlist and change text when "Unwatch" is clicked', async () => {
    removeFromWatchlist.mockResolvedValueOnce({}); // Simulate successful API call
    render(<AddToWatchlistButton playerId={playerId} isInitiallyWatched={true} onToggle={onToggleMock} />);

    const removeButton = screen.getByText('Unwatch');
    fireEvent.click(removeButton);

    expect(screen.getByRole('button')).toBeDisabled();

    await waitFor(() => expect(removeFromWatchlist).toHaveBeenCalledWith(playerId));
    await screen.findByText('Watch');
    expect(onToggleMock).toHaveBeenCalledWith(false); // New state is watched: false
  });

  test('should handle API error gracefully when adding', async () => {
    addToWatchlist.mockRejectedValueOnce(new Error('API Error'));
    render(<AddToWatchlistButton playerId={playerId} isInitiallyWatched={false} onToggle={onToggleMock} />);

    const addButton = screen.getByText('Watch');
    fireEvent.click(addButton);

    await waitFor(() => expect(addToWatchlist).toHaveBeenCalledWith(playerId));
    // Button should revert to original state or show error, here it reverts
    await screen.findByText('Watch');
    expect(onToggleMock).not.toHaveBeenCalled();
  });

  test('should handle API error gracefully when removing', async () => {
    removeFromWatchlist.mockRejectedValueOnce(new Error('API Error'));
    render(<AddToWatchlistButton playerId={playerId} isInitiallyWatched={true} onToggle={onToggleMock} />);

    const removeButton = screen.getByText('Unwatch');
    fireEvent.click(removeButton);

    await waitFor(() => expect(removeFromWatchlist).toHaveBeenCalledWith(playerId));
    await screen.findByText('Unwatch');
    expect(onToggleMock).not.toHaveBeenCalled();
  });

   test('should show loading state and be disabled during API call', async () => {
    // Use a promise that doesn't resolve immediately to check loading state
    const slowPromise = new Promise(resolve => setTimeout(() => resolve({}), 100));
    addToWatchlist.mockReturnValueOnce(slowPromise);

    render(<AddToWatchlistButton playerId={playerId} isInitiallyWatched={false} />);
    const button = screen.getByText('Watch');
    fireEvent.click(button);

    expect(button).toBeDisabled();
    // Verify spinner presence (it has role="status" but might be hidden)
    // We can just verify the text is gone or check button state

    await screen.findByText('Unwatch');
    expect(button).not.toBeDisabled();
  });
});
