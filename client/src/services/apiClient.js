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
      if (error.response.status === 401) {
         // Optionally redirect to login or show specific message
         toast.error('Session expired or unauthorized. Please login.');
         // Potential: window.location.href = '/login'; (Use with caution in SPA)
      } else if (error.response.status === 403) {
         toast.error('You do not have permission to perform this action.');
      } else {
         // Other 4xx errors
         toast.error(error.response.data || 'An error occurred.');
      }
    }

    return Promise.reject(error);
  }
);

// Function to set the auth token globally for all apiClient requests
export const setAuthToken = (token) => {
  if (token) {
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
