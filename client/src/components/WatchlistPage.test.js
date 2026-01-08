import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WatchlistPage from './WatchlistPage';
import { getWatchlist, removeFromWatchlist } from '../services/apiClient'; // removeFromWatchlist needed for button interaction

// Mock the apiClient module
jest.mock('../services/apiClient', () => ({
  getWatchlist: jest.fn(),
  // We also need to mock functions used by AddToWatchlistButton if it's deeply rendered
  // and its interactions are tested through WatchlistPage
  addToWatchlist: jest.fn(),
  removeFromWatchlist: jest.fn(),
}));

// Mock AddToWatchlistButton to simplify testing of WatchlistPage itself
// Or allow its full render and mock its specific API calls as done above.
// For this test, we'll allow its full render and rely on the apiClient mocks.

const mockPlayers = [
  { _id: '1', name: 'Player One', team: { name: 'Team A' }, nationality: 'Wonderland' },
  { _id: '2', name: 'Player Two', team: { name: 'Team B' }, nationality: 'Oz' },
];

describe('WatchlistPage', () => {
  beforeEach(() => {
    getWatchlist.mockClear();
    removeFromWatchlist.mockClear(); // Clear this as it's used by the button
  });

  test('should display loading message initially', () => {
    getWatchlist.mockReturnValueOnce(new Promise(() => {})); // Never resolves
    render(<WatchlistPage />);
    expect(screen.getByText('Loading watchlist...')).toBeInTheDocument();
  });

  test('should display error message if API call fails', async () => {
    getWatchlist.mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<WatchlistPage />);
    await screen.findByText(/Error: Failed to fetch/i);
  });

  test('should display "Your watchlist is empty" if watchlist is empty', async () => {
    getWatchlist.mockResolvedValueOnce([]);
    render(<WatchlistPage />);
    await screen.findByText('Your watchlist is empty.');
  });

  test('should display players if watchlist is not empty', async () => {
    getWatchlist.mockResolvedValueOnce(mockPlayers);
    render(<WatchlistPage />);
    await screen.findByText('Player One');
    expect(screen.getByText('Player Two')).toBeInTheDocument();
    // Check if AddToWatchlistButton is rendered for each (it will say "Remove from Watchlist")
    expect(screen.getAllByText('Remove from Watchlist').length).toBe(mockPlayers.length);
  });

  test('should remove player from list when its "Remove from Watchlist" button is clicked', async () => {
    getWatchlist.mockResolvedValueOnce([...mockPlayers]); // Initial load
    removeFromWatchlist.mockResolvedValueOnce({}); // Mock successful removal for player '1'

    render(<WatchlistPage />);

    await screen.findByText('Player One');

    // Find the "Remove from Watchlist" button associated with Player One
    // This assumes the button is a direct child or identifiable.
    // A more robust way would be to find the button within the player's card.
    const playerOneCard = screen.getByText('Player One').closest('div'); // Find the parent card
    const removeButtons = screen.getAllByText('Remove from Watchlist');

    // Let's assume the first "Remove from Watchlist" button corresponds to "Player One"
    // This could be fragile if order changes or if buttons are not unique enough.
    // A data-testid on the button including player ID would be better.
    // For now, we find the button within player one's card.
    const playerOneRemoveButton = Array.from(playerOneCard.querySelectorAll('button')).find(
        (btn) => btn.textContent === 'Remove from Watchlist'
      );

    fireEvent.click(playerOneRemoveButton);

    await waitFor(() => expect(removeFromWatchlist).toHaveBeenCalledWith('1'));
    // Player One should be removed from the list optimistically
    await waitFor(() => expect(screen.queryByText('Player One')).not.toBeInTheDocument());
    // Player Two should still be there
    expect(screen.getByText('Player Two')).toBeInTheDocument();
  });

  test('AddToWatchlistButton for each player is initially in "Remove from Watchlist" state', async () => {
    getWatchlist.mockResolvedValueOnce(mockPlayers);
    render(<WatchlistPage />);
    await waitFor(() => {
      const removeButtons = screen.getAllByRole('button', { name: /remove from watchlist/i });
      expect(removeButtons.length).toBe(mockPlayers.length);
    });
  });
});
