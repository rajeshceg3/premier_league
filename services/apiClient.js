// services/apiClient.js
const axios = require('axios');
const winston = require('winston');
const { API_KEY, API_BASE_URL } = require('../config/config');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io', // Replace if your host is different
  },
});

const getFixtures = async (params) => {
  try {
    const response = await apiClient.get('fixtures', { params });
    return response.data;
  } catch (error) {
    winston.error('Error fetching fixtures:', error);
    throw error;
  }
};

const getTeams = async (params) => {
  try {
    const response = await apiClient.get('teams', { params });
    return response.data;
  } catch (error) {
    winston.error('Error fetching teams:', error);
    throw error;
  }
};

module.exports = {
  getFixtures,
  getTeams,
};
