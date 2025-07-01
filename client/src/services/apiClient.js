import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Set base URL for all requests
});

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
  try {
    const response = await apiClient.get('/teams'); // Path is relative to baseURL
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Watchlist functions
export const getWatchlist = async () => {
  try {
    const response = await apiClient.get('/users/watchlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching watchlist:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const addToWatchlist = async (playerId) => {
  try {
    const response = await apiClient.post(`/users/watchlist/${playerId}`);
    return response.data;
  } catch (error) {
    console.error('Error adding to watchlist:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const removeFromWatchlist = async (playerId) => {
  try {
    const response = await apiClient.delete(`/users/watchlist/${playerId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from watchlist:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export default apiClient; // Export the configured axios instance as default
