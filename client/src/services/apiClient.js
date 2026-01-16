import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api', // Use env var or default to relative path
});

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const expectedError =
      error.response &&
      error.response.status >= 400 &&
      error.response.status < 500;

    if (!expectedError) {
      // Unexpected errors (network, server 5xx)
      console.error('An unexpected error occurred:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    } else {
      // Expected errors (4xx)
      // Note: We allow local catch blocks to handle specific validation errors by rejecting the promise.
      // Global handling is reserved for auth issues (401/403).

      if (error.response.status === 401) {
         toast.error('Session expired or unauthorized. Please login.');
      } else if (error.response.status === 403) {
         toast.error('You do not have permission to perform this action.');
      }
      // For other 400 errors, we can optionally show a generic toast or let the component handle it.
      // Given the review feedback, we'll let the component handle specific validation errors
      // to preserve granularity, but we ensure 404s etc are caught if needed.
    }

    return Promise.reject(error);
  }
);

// Function to set the auth token globally for all apiClient requests
export const setAuthToken = (token) => {
  if (token) {
    // Backend expects x-auth-token per middleware/auth.js
    apiClient.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete apiClient.defaults.headers.common['x-auth-token'];
  }
};

// Example function (mentioned as existing in the prompt)
export const getTeams = async () => {
  const response = await apiClient.get('/teams');
  return response.data;
};

// Watchlist functions
export const getWatchlist = async () => {
  const response = await apiClient.get('/users/watchlist');
  return response.data;
};

export const addToWatchlist = async (playerId) => {
  const response = await apiClient.post(`/users/watchlist/${playerId}`);
  return response.data;
};

export const removeFromWatchlist = async (playerId) => {
  const response = await apiClient.delete(`/users/watchlist/${playerId}`);
  return response.data;
};

export default apiClient;
