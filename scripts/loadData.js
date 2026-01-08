// scripts/loadData.js
const mongoose = require('mongoose');
const { getTeams } = require('../services/apiClient');
const { Team } = require('../models/team'); // Assuming Team exports { Team } or model directly
const config = require('config');

// Configure MongoDB connection
const MONGO_URI = config.get('db') || 'mongodb://localhost:27017/premier_league_dev';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function loadTeamsData(leagueId = '39') {
  // Example: Premier League
  console.log('Loading teams data...');
  try {
    const currentYear = new Date().getFullYear();
    const teamsData = await getTeams({ league: leagueId, season: currentYear });

    if (!teamsData || !teamsData.response || teamsData.response.length === 0) {
      console.log('No teams data received from API.');
      return;
    }

    for (const teamAPI of teamsData.response) {
      const teamData = teamAPI.team;

      // Basic transformation
      const teamPayload = {
        name: teamData.name,
        // Add other fields as needed, ensuring they match schema
        coach: 'Unknown', // Required by schema
        // apiFootballId: teamData.id, // Not in current schema
        // logoUrl: teamData.logo, // Not in current schema
      };

      await Team.findOneAndUpdate({ name: teamData.name }, teamPayload, {
        upsert: true,
        new: true,
      });
      console.log(`Team ${teamData.name} processed.`);
    }
    console.log('Teams data loaded successfully.');
  } catch (error) {
    console.error('Error loading teams data:', error);
  }
}

async function main() {
  await connectDB();

  // Example: Load teams for Premier League
  await loadTeamsData('39');

  await mongoose.disconnect();
  console.log('MongoDB disconnected.');
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error in main execution:', error);
    mongoose.disconnect();
    process.exit(1);
  });
}

module.exports = { loadTeamsData }; // Export for testing if needed
