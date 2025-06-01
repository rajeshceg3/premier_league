// services/apiClient.js
import axios from 'axios';
import { API_KEY, API_BASE_URL } from '../config/config.js';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io' // Replace if your host is different
  }
});

export const getFixtures = async (params) => {
  try {
    const response = await apiClient.get('fixtures', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    throw error;
  }
};

export const getTeams = async (params) => {
  try {
    const response = await apiClient.get('teams', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

// Add more functions for other endpoints as needed
