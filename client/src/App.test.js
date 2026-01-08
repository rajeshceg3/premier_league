import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app logo', () => {
  render(<App />);
  const linkElement = screen.getByText(/AppLogo/i);
  expect(linkElement).toBeInTheDocument();
});
