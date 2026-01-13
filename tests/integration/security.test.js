const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { User } = require('../../models/user');
const { Team } = require('../../models/team');
const { Player } = require('../../models/player');
const { Agent } = require('../../models/agent');
const { Loan } = require('../../models/loan');

let server;
let mongoServer;
let adminToken;
let userToken;

describe('Security Integration Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    // eslint-disable-next-line global-require
    server = require('../../index');
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Team.deleteMany({});
    await Player.deleteMany({});
    await Agent.deleteMany({});
    await Loan.deleteMany({});

    // Create Admin
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      isAdmin: true,
    });
    await admin.save();
    adminToken = admin.createAuthToken();

    // Create Regular User
    const user = new User({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
      isAdmin: false,
    });
    await user.save();
    userToken = user.createAuthToken();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Team.deleteMany({});
    await Player.deleteMany({});
  });

  describe('Teams Routes Security', () => {
    describe('POST /api/teams', () => {
      it('should return 401 if client is not logged in', async () => {
        const res = await request(server)
          .post('/api/teams')
          .send({ name: 'New Team', coach: 'Coach' });
        expect(res.status).toBe(401);
      });

      it('should return 403 if client is logged in but not admin', async () => {
        const res = await request(server)
          .post('/api/teams')
          .set('x-auth-token', userToken)
          .send({ name: 'New Team', coach: 'Coach' });
        expect(res.status).toBe(403);
      });

      it('should return 200 if client is admin', async () => {
        const res = await request(server)
          .post('/api/teams')
          .set('x-auth-token', adminToken)
          .send({ name: 'New Team', coach: 'Coach' });
        expect(res.status).toBe(200);
      });
    });

    describe('PUT /api/teams/:id', () => {
      let team;
      beforeEach(async () => {
        team = new Team({ name: 'Team1', coach: 'Coach1' });
        await team.save();
      });

      it('should return 401 if not logged in', async () => {
        const res = await request(server)
          .put(`/api/teams/${team._id}`)
          .send({ name: 'Team2', coach: 'Coach2' });
        expect(res.status).toBe(401);
      });

      it('should return 403 if not admin', async () => {
        const res = await request(server)
          .put(`/api/teams/${team._id}`)
          .set('x-auth-token', userToken)
          .send({ name: 'Team2', coach: 'Coach2' });
        expect(res.status).toBe(403);
      });
    });

    describe('DELETE /api/teams/:id', () => {
      let team;
      beforeEach(async () => {
        team = new Team({ name: 'Team1', coach: 'Coach1' });
        await team.save();
      });

      it('should return 401 if not logged in', async () => {
        const res = await request(server).delete(`/api/teams/${team._id}`);
        expect(res.status).toBe(401);
      });

      it('should return 403 if not admin', async () => {
        const res = await request(server)
          .delete(`/api/teams/${team._id}`)
          .set('x-auth-token', userToken);
        expect(res.status).toBe(403);
      });
    });
  });

  describe('Players Routes Security', () => {
    let team;
    beforeEach(async () => {
      team = new Team({ name: 'Team1', coach: 'Coach1' });
      await team.save();
    });

    describe('POST /api/players', () => {
      it('should return 401 if client is not logged in', async () => {
        const res = await request(server).post('/api/players').send({
          name: 'Player1',
          teamId: team._id,
          loanDaysRemaining: 10,
          loanCost: 100,
        });
        expect(res.status).toBe(401);
      });

      it('should return 200 if client is logged in (regular user)', async () => {
        const res = await request(server).post('/api/players').set('x-auth-token', userToken).send({
          name: 'Player1',
          teamId: team._id,
          loanDaysRemaining: 10,
          loanCost: 100,
        });
        expect(res.status).toBe(200);
      });
    });
  });

  describe('Loans Routes Security', () => {
    let agent;
    let player;
    let team;

    beforeEach(async () => {
      team = new Team({ name: 'Team1', coach: 'Coach1' });
      await team.save();

      player = new Player({
        name: 'Player1',
        team: { _id: team._id, name: team.name, coach: team.coach },
        loanDaysRemaining: 10,
        loanCost: 100,
      });
      await player.save();

      agent = new Agent({
        name: 'Agent1',
        phone: '1234567890',
      });
      await agent.save();
    });

    describe('POST /api/loans', () => {
      it('should return 401 if client is not logged in', async () => {
        const res = await request(server).post('/api/loans').send({
          agentId: agent._id,
          playerId: player._id,
        });
        expect(res.status).toBe(401);
      });

      it('should return 200 if client is logged in', async () => {
        const res = await request(server).post('/api/loans').set('x-auth-token', userToken).send({
          agentId: agent._id,
          playerId: player._id,
        });
        expect(res.status).toBe(200);
      });
    });
  });
});
