// scripts/loadData.js
import mongoose from 'mongoose';
import { getTeams, getFixtures } from '../services/apiClient.js'; // Assuming getFixtures might be used for players or specific league/season data
import Team from '../models/team.js';
import { Player } from '../models/player.js'; // Assuming Player model is exported as { Player }
import { API_KEY, API_BASE_URL } from '../config/config.js'; // For MongoDB connection string if needed, or other configs

// Configure MongoDB connection (replace with your actual connection string)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your_database_name';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if DB connection fails
  }
}

async function loadTeamsData(leagueId = '39') { // Example: Premier League
  console.log('Loading teams data...');
  try {
    // Adjust params as needed for the API endpoint.
    // This is a common structure for fetching teams by league and season.
    const currentYear = new Date().getFullYear();
    const teamsData = await getTeams({ league: leagueId, season: currentYear });

    if (!teamsData || !teamsData.response || teamsData.response.length === 0) {
      console.log('No teams data received from API.');
      return;
    }

    for (const teamAPI of teamsData.response) {
      const teamData = teamAPI.team;
      const venueData = teamAPI.venue; // Venue data might be useful too

      // Basic transformation, adapt according to your exact API response structure
      const teamPayload = {
        name: teamData.name,
        apiFootballId: teamData.id,
        logoUrl: teamData.logo,
        country: teamData.country,
        // league: { name: teamsData.parameters.league, season: teamsData.parameters.season }, // Or more detailed league object
        // Add other fields from venueData if needed, e.g. venueName: venueData.name
      };

      await Team.findOneAndUpdate({ apiFootballId: teamData.id }, teamPayload, { upsert: true, new: true });
      console.log(`Team ${teamData.name} processed.`);
    }
    console.log('Teams data loaded successfully.');
  } catch (error) {
    console.error('Error loading teams data:', error);
  }
}

async function loadPlayersData(teamId) { // Load players for a specific team
  console.log(`Loading players data for team ID: ${teamId}...`);
  // This is a placeholder. The actual endpoint and params to get players might be different.
  // Often, players are fetched by team and season, or by league and season.
  // Example: apiClient.get('players', { params: { team: teamId, season: '2023' } });
  // For now, this function is a stub.
  // You'll need to implement fetching players from API-Football.
  // The getFixtures import might be a misdirection if not used for players.
  // If players are part of the 'fixtures' endpoint (e.g. lineups), that's one way.
  // More commonly, there's a dedicated 'players' endpoint.

  // Pseudocode for player loading:
  // const playersData = await apiClient.get('players', { params: { team: teamApiId, season: 'YYYY' } });
  // if (playersData && playersData.response) {
  //   for (const playerAPI of playersData.response) {
  //     const pData = playerAPI.player;
  //     const stats = playerAPI.statistics; // Assuming stats are part of the response

  //     const playerPayload = {
  //       name: pData.name,
  //       apiFootballId: pData.id,
  //       dateOfBirth: new Date(pData.birth.date),
  //       nationality: pData.nationality,
  //       // statistics: formatStats(stats), // You might need a helper to format/select stats
  //       // team: needs to be linked to your DB's team _id
  //       // loanDaysRemaining, loanCost: These seem specific to your app, not from API-Football typically
  //     };
  //     // Find team in DB to link
  //     // const teamInDb = await Team.findOne({ apiFootballId: teamApiId });
  //     // if (teamInDb) playerPayload.team = teamInDb._id; // Or however you structure the 'team' field in Player schema
  //     // await Player.findOneAndUpdate({ apiFootballId: pData.id }, playerPayload, { upsert: true, new: true });
  //     // console.log(`Player ${pData.name} processed.`);
  //   }
  // }
  console.log('Players data loading (stub) finished.');
}


async function main() {
  await connectDB();

  // Example: Load teams for Premier League
  await loadTeamsData('39');

  // Example: After loading teams, you might want to load players for each team
  // const allTeams = await Team.find({});
  // for (const team of allTeams) {
  //   if(team.apiFootballId) {
  //     await loadPlayersData(team.apiFootballId); // Pass API ID
  //   }
  // }

  await mongoose.disconnect();
  console.log('MongoDB disconnected.');
}

main().catch(error => {
  console.error('Unhandled error in main execution:', error);
  mongoose.disconnect();
  process.exit(1);
});
