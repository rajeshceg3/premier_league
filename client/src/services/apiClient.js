import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000, // 10 seconds timeout
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
      console.error('An unexpected error occurred:', error);
      if (error.code === 'ECONNABORTED') {
          toast.error('Request timed out. Please try again.');
      } else if (error.message === 'Network Error') {
          toast.error('Network error. Please check your internet connection.');
      } else {
          toast.error('An unexpected error occurred. Please try again later.');
      }
    } else {
      if (error.response.status === 401) {
         toast.error('Session expired or unauthorized. Please login.');
      } else if (error.response.status === 403) {
         toast.error('You do not have permission to perform this action.');
      } else if (error.response.status === 429) {
         toast.error('Too many requests. Please try again later.');
      } else {
         toast.error(error.response.data || 'An error occurred.');
      }
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete apiClient.defaults.headers.common['x-auth-token'];
  }
};

export const getTeams = async () => {
  const response = await apiClient.get('/teams');
  return response.data;
};

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
