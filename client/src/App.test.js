import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the AuthContext
jest.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

test('renders login page title', () => {
  window.history.pushState({}, 'Login page', '/login');
  render(<App />);
  const welcomeElement = screen.getByText(/Welcome Back/i);
  expect(welcomeElement).toBeInTheDocument();
});
