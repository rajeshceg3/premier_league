import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios');

// Manually mock matchMedia for this test file as well to ensure it overrides any global issues or conflicts
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
  };
};

test('renders app title', () => {
  render(<App />);
  const linkElement = screen.getByText(/Premier League Loans/i);
  expect(linkElement).toBeInTheDocument();
});
