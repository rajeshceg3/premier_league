import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import WatchlistPage from './WatchlistPage';
import { getWatchlist, removeFromWatchlist } from '../services/apiClient';

// Mock the apiClient module
jest.mock('../services/apiClient', () => ({
  getWatchlist: jest.fn(),
  addToWatchlist: jest.fn(),
  removeFromWatchlist: jest.fn(),
}));

const mockPlayers = [
  { _id: '1', name: 'Player One', team: { name: 'Team A' }, nationality: 'Wonderland' },
  { _id: '2', name: 'Player Two', team: { name: 'Team B' }, nationality: 'Oz' },
];

describe('WatchlistPage', () => {
  beforeEach(() => {
    getWatchlist.mockClear();
    removeFromWatchlist.mockClear();
  });

  test('should display loading message initially', () => {
    getWatchlist.mockReturnValueOnce(new Promise(() => {}));
    render(<WatchlistPage />);
    // The loading spinner has "Loading..." in visually-hidden span
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should display error message if API call fails', async () => {
    getWatchlist.mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<WatchlistPage />);
    // "Failed to fetch" text will be present
    await screen.findByText('Failed to fetch');
  });

  test('should display "Your watchlist is empty" if watchlist is empty', async () => {
    getWatchlist.mockResolvedValueOnce([]);
    render(<WatchlistPage />);
    // The text is split by a <br/> and link, but "Your watchlist is empty." is in the alert box.
    // However, react-testing-library's getByText might need exact match or regex.
    // The component has: Your watchlist is empty. <br/> Go to ...
    // Using a regex is safer.
    await screen.findByText(/Your watchlist is empty/i);
  });

  test('should display players if watchlist is not empty', async () => {
    getWatchlist.mockResolvedValueOnce(mockPlayers);
    render(<WatchlistPage />);
    await screen.findByText('Player One');
    expect(screen.getByText('Player Two')).toBeInTheDocument();

    // AddToWatchlistButton renders "Remove from Watchlist" when isInitiallyWatched is true
    // There should be 2 such buttons
    const removeButtons = screen.getAllByRole('button', { name: /remove from watchlist/i });
    expect(removeButtons.length).toBe(mockPlayers.length);
  });

  test('should remove player from list when its "Remove from Watchlist" button is clicked', async () => {
    getWatchlist.mockResolvedValueOnce([...mockPlayers]);
    removeFromWatchlist.mockResolvedValueOnce({});

    render(<WatchlistPage />);

    await screen.findByText('Player One');

    // Find the card for Player One
    // We can find the element with text "Player One", then traverse up to the card body
    // Or we can assume the button is in the same container.
    // A robust way:
    const playerOneNameElement = screen.getByText('Player One');
    // The card body contains the name and the button.
    // We can use `closest` or just search within the screen if we assume unique names.
    // But let's be precise.
    const cardBody = playerOneNameElement.closest('.card-body');
    const playerOneRemoveButton = within(cardBody).getByRole('button', { name: /remove from watchlist/i });

    fireEvent.click(playerOneRemoveButton);

    await waitFor(() => expect(removeFromWatchlist).toHaveBeenCalledWith('1'));

    // Player One should be removed
    await waitFor(() => expect(screen.queryByText('Player One')).not.toBeInTheDocument());

    // Player Two should still be there
    expect(screen.getByText('Player Two')).toBeInTheDocument();
  });
});
