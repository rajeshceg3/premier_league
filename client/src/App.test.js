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
  render(<App />);
  // Assuming the login page is the default for unauthenticated users
  // and it has a "Sign In" or "Login" text.
  // The polished LoginForm has "Welcome Back"
  const welcomeElement = screen.getByText(/Welcome Back/i);
  expect(welcomeElement).toBeInTheDocument();
});
