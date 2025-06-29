const request = require('supertest');
const { Team } = require('../../models/team'); // To interact with the DB for setup/teardown
const mongoose = require('mongoose');
let server; // To hold the server instance

describe('Teams API', () => {
  beforeEach(() => {
    server = require('../../index'); // Start server before each test
  });

  afterEach(async () => {
    await server.close(); // Close server after each test
    await Team.deleteMany({}); // Clean up the Team collection
  });

  describe('GET /api/teams', () => {
    it('should return all teams', async () => {
      // Insert some teams to test with
      await Team.collection.insertMany([
        { name: 'Team Alpha', coach: 'Coach A' },
        { name: 'Team Beta', coach: 'Coach B' },
      ]);

      const res = await request(server).get('/api/teams');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(t => t.name === 'Team Alpha' && t.coach === 'Coach A')).toBeTruthy();
      expect(res.body.some(t => t.name === 'Team Beta' && t.coach === 'Coach B')).toBeTruthy();
    });
  });

  describe('GET /api/teams/:id', () => {
    it('should return a team if valid id is passed', async () => {
      const team = new Team({ name: 'Team Gamma', coach: 'Coach C' });
      await team.save();

      const res = await request(server).get('/api/teams/' + team._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', team.name);
      expect(res.body).toHaveProperty('coach', team.coach);
    });

    it('should return 400 if invalid ID is passed', async () => {
      const res = await request(server).get('/api/teams/1');
      expect(res.status).toBe(400);
    });

    it('should return 404 if no team with the given id exists', async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      const res = await request(server).get('/api/teams/' + id);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/teams', () => {
    // let token; // Assuming you have auth, otherwise remove token logic

    // beforeEach(() => {
      // If you have authentication, generate a token here
      // token = new User().generateAuthToken();
      // For now, we'll assume no auth or a way to bypass for tests
    // });

    const exec = async (teamData) => {
      return await request(server)
        .post('/api/teams')
        // .set('x-auth-token', token) // If auth is used
        .send(teamData);
    };

    it('should return 200 and the team if it is valid', async () => {
      const res = await exec({ name: 'Team Delta', coach: 'Coach D' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'Team Delta');
      expect(res.body).toHaveProperty('coach', 'Coach D');

      const teamInDb = await Team.findById(res.body._id);
      expect(teamInDb).not.toBeNull();
      expect(teamInDb.name).toBe('Team Delta');
      expect(teamInDb.coach).toBe('Coach D');
    });

    it('should return 400 if name is missing', async () => {
      const res = await exec({ coach: 'Coach D' });
      expect(res.status).toBe(400);
    });

    it('should return 400 if coach is missing', async () => {
      const res = await exec({ name: 'Team Epsilon' });
      expect(res.status).toBe(400);
    });

    it('should return 400 if name is less than 4 characters', async () => {
      const res = await exec({ name: 'Tea', coach: 'Coach F' });
      expect(res.status).toBe(400);
    });

    it('should return 400 if name is more than 50 characters', async () => {
      const name = new Array(52).join('a'); // 51 chars
      const res = await exec({ name: name, coach: 'Coach G' });
      expect(res.status).toBe(400);
    });

    it('should return 400 if coach name is less than 2 characters', async () => {
      const res = await exec({ name: 'Valid Team Name', coach: 'C' });
      expect(res.status).toBe(400);
    });

    it('should return 400 if coach name is more than 50 characters', async () => {
      const coach = new Array(52).join('c'); // 51 chars
      const res = await exec({ name: 'Valid Team Name', coach: coach });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/teams/:id', () => {
    let team;
    let id;
    const newName = 'Updated Team Name';
    const newCoach = 'Updated Coach Name';

    beforeEach(async () => {
      team = new Team({ name: 'Initial Team', coach: 'Initial Coach' });
      await team.save();
      id = team._id.toHexString();
    });

    const exec = async (updateData, teamId) => {
      return await request(server)
        .put('/api/teams/' + (teamId || id))
        // .set('x-auth-token', token) // If auth
        .send(updateData);
    };

    it('should return 200 and the updated team if input is valid', async () => {
      const res = await exec({ name: newName, coach: newCoach });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', id);
      expect(res.body).toHaveProperty('name', newName);
      expect(res.body).toHaveProperty('coach', newCoach);

      const updatedTeamInDb = await Team.findById(id);
      expect(updatedTeamInDb.name).toBe(newName);
      expect(updatedTeamInDb.coach).toBe(newCoach);
    });

    it('should return 400 if ID is invalid', async () => {
      const res = await exec({ name: newName, coach: newCoach }, '1');
      expect(res.status).toBe(400);
    });

    it('should return 404 if team with given ID was not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toHexString();
      const res = await exec({ name: newName, coach: newCoach }, nonExistentId);
      expect(res.status).toBe(404);
    });

    it('should return 400 if updated name is less than 4 characters', async () => {
      const res = await exec({ name: 'Upd', coach: newCoach });
      expect(res.status).toBe(400);
    });

    it('should return 400 if updated coach is less than 2 characters', async () => {
      const res = await exec({ name: newName, coach: 'U' });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/teams/:id', () => {
    let team;
    let id;

    beforeEach(async () => {
      team = new Team({ name: 'Team ToDelete', coach: 'Coach ToDelete' });
      await team.save();
      id = team._id.toHexString();
    });

    const exec = async (teamId) => {
      return await request(server)
        .delete('/api/teams/' + (teamId || id))
        // .set('x-auth-token', token); // If auth
    };

    it('should return 200 and the removed team if ID is valid', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', id);
      expect(res.body).toHaveProperty('name', team.name);
      expect(res.body).toHaveProperty('coach', team.coach);

      const teamInDb = await Team.findById(id);
      expect(teamInDb).toBeNull();
    });

    it('should return 400 if ID is invalid', async () => {
      const res = await exec('1');
      expect(res.status).toBe(400);
    });

    it('should return 404 if no team with the given ID was found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toHexString();
      const res = await exec(nonExistentId);
      expect(res.status).toBe(404);
    });
  });
});
