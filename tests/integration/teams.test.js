const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Team } = require('../../models/team');

let server;
let mongoServer;

describe('Teams API', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    // Connect explicitly before app can try
    await mongoose.connect(mongoUri);

    // eslint-disable-next-line global-require
    server = require('../../index'); // Gets 'app'
  });

  afterEach(async () => {
    await Team.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('GET /api/teams', () => {
    it('should return all teams', async () => {
      await Team.collection.insertMany([
        { name: 'Team Alpha', coach: 'Coach A' },
        { name: 'Team Beta', coach: 'Coach B' },
      ]);

      const res = await request(server).get('/api/teams');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((t) => t.name === 'Team Alpha' && t.coach === 'Coach A')).toBeTruthy();
      expect(res.body.some((t) => t.name === 'Team Beta' && t.coach === 'Coach B')).toBeTruthy();
    });
  });

  describe('GET /api/teams/:id', () => {
    it('should return a team if valid id is passed', async () => {
      const team = new Team({ name: 'Team Gamma', coach: 'Coach C' });
      await team.save();

      const res = await request(server).get(`/api/teams/${team._id}`);

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
      const res = await request(server).get(`/api/teams/${id}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/teams', () => {
    const exec = async (teamData) => {
      return request(server).post('/api/teams').send(teamData);
    };

    it('should return 200 and the team if it is valid', async () => {
      const res = await exec({ name: 'Team Delta', coach: 'Coach D' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'Team Delta');
      expect(res.body).toHaveProperty('coach', 'Coach D');
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
      const name = new Array(52).join('a');
      const res = await exec({ name, coach: 'Coach G' });
      expect(res.status).toBe(400);
    });

    it('should return 400 if coach name is less than 2 characters', async () => {
      const res = await exec({ name: 'Valid Team Name', coach: 'C' });
      expect(res.status).toBe(400);
    });

    it('should return 400 if coach name is more than 50 characters', async () => {
      const coach = new Array(52).join('c');
      const res = await exec({ name: 'Valid Team Name', coach });
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
      return request(server)
        .put(`/api/teams/${teamId || id}`)
        .send(updateData);
    };

    it('should return 200 and the updated team if input is valid', async () => {
      const res = await exec({ name: newName, coach: newCoach });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', id);
      expect(res.body).toHaveProperty('name', newName);
      expect(res.body).toHaveProperty('coach', newCoach);
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
      return request(server).delete(`/api/teams/${teamId || id}`);
    };

    it('should return 200 and the removed team if ID is valid', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
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
