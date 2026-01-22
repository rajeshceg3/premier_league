import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WatchlistPage from './WatchlistPage';
import { getWatchlist, removeFromWatchlist } from '../services/apiClient';
import { BrowserRouter } from 'react-router-dom';

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

const renderWithRouter = (ui) => {
    return render(
        <BrowserRouter>
            {ui}
        </BrowserRouter>
    );
};

describe('WatchlistPage', () => {
  beforeEach(() => {
    getWatchlist.mockClear();
    removeFromWatchlist.mockClear();
  });

  test('should display loading message initially', () => {
    getWatchlist.mockReturnValueOnce(new Promise(() => {}));
    renderWithRouter(<WatchlistPage />);
    // The loading spinner has "Loading..." in visually-hidden span
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should display error message if API call fails', async () => {
    getWatchlist.mockRejectedValueOnce(new Error('Failed to fetch'));
    renderWithRouter(<WatchlistPage />);
    // "Failed to fetch" text will be present
    await screen.findByText(/Failed to fetch/i);
  });

  test('should display "Your watchlist is empty" if watchlist is empty', async () => {
    getWatchlist.mockResolvedValueOnce([]);
    renderWithRouter(<WatchlistPage />);
    // The text is split by a <br/> and link, but "Your watchlist is empty." is in the alert box.
    // However, react-testing-library's getByText might need exact match or regex.
    // The component has: Your watchlist is empty. <br/> Go to ...
    // Using a regex is safer.
    await screen.findByText(/Your watchlist is empty/i);
  });

  test('should display players if watchlist is not empty', async () => {
    getWatchlist.mockResolvedValueOnce(mockPlayers);
    renderWithRouter(<WatchlistPage />);
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

    renderWithRouter(<WatchlistPage />);

    await screen.findByText('Player One');

    // Find the card for Player One
    // We can find the element with text "Player One", then traverse up to the card body
    // Or we can assume the button is in the same container.
    // A robust way:
    // The mock data returns Player One first, then Player Two.
    // So the first "Remove" button corresponds to Player One.
    const removeButtons = screen.getAllByRole('button', { name: /remove from watchlist/i });
    const playerOneRemoveButton = removeButtons[0];

    fireEvent.click(playerOneRemoveButton);

    await waitFor(() => expect(removeFromWatchlist).toHaveBeenCalledWith('1'));

    // Player One should be removed
    await waitFor(() => expect(screen.queryByText('Player One')).not.toBeInTheDocument());

    // Player Two should still be there
    expect(screen.getByText('Player Two')).toBeInTheDocument();
  });
});
