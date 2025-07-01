const request = require('supertest');
const { User } = require('../../models/user');
const { Player } = require('../../models/player');
const { Team } = require('../../models/team');
const mongoose = require('mongoose');

let server;
let token;
let userId;
let samplePlayer;
let sampleTeam;
let otherPlayer;

describe('/api/users/watchlist', () => {
  beforeEach(async () => {
    server = require('../../index'); // Start server from your main app file

    sampleTeam = new Team({ name: 'Test Team FC', stadium: 'Test Stadium Arena' });
    await sampleTeam.save();

    const userPayload = {
      name: 'Test User Watchlist',
      email: 'testwatchlist@example.com',
      password: 'password123',
      isAdmin: false,
    };
    // Register user directly or use API if preferred, then login to get token
    const user = new User(userPayload);
    await user.save();
    userId = user._id;
    token = user.createAuthToken();

    samplePlayer = new Player({
      name: 'Test Player Alpha',
      team: sampleTeam.toObject(), // Embed team subdocument
      loanDaysRemaining: 10,
      loanCost: 100,
      // apiFootballId, statistics, dateOfBirth, nationality can be omitted if not strictly required by model for this test
    });
    await samplePlayer.save();

    otherPlayer = new Player({
      name: 'Test Player Beta',
      team: sampleTeam.toObject(),
      loanDaysRemaining: 5,
      loanCost: 50,
    });
    await otherPlayer.save();
  });

  afterEach(async () => {
    await server.close(); // Close server
    await User.deleteMany({});
    await Player.deleteMany({});
    await Team.deleteMany({});
  });

  // GET /api/users/watchlist
  describe('GET /', () => {
    it('should return 401 if client is not logged in', async () => {
      const res = await request(server).get('/api/users/watchlist');
      expect(res.status).toBe(401);
    });

    it('should return the user watchlist (empty initially)', async () => {
      const res = await request(server)
        .get('/api/users/watchlist')
        .set('x-auth-token', token);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return the user watchlist with players if populated', async () => {
      await User.findByIdAndUpdate(userId, { $addToSet: { watchlist: samplePlayer._id } });
      const res = await request(server)
        .get('/api/users/watchlist')
        .set('x-auth-token', token);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe(samplePlayer.name);
      expect(res.body[0]._id.toString()).toBe(samplePlayer._id.toString());
    });
  });

  // POST /api/users/watchlist/:playerId
  describe('POST /:playerId', () => {
    it('should return 401 if client is not logged in', async () => {
      const res = await request(server).post(`/api/users/watchlist/${samplePlayer._id}`);
      expect(res.status).toBe(401);
    });

    it('should add a player to watchlist if valid and authenticated', async () => {
      const res = await request(server)
        .post(`/api/users/watchlist/${samplePlayer._id}`)
        .set('x-auth-token', token);
      expect(res.status).toBe(200);
      const userInDb = await User.findById(userId);
      expect(userInDb.watchlist.map(id => id.toString())).toContain(samplePlayer._id.toString());
    });

    it('should return 400 if playerId is an invalid ObjectId', async () => {
      const res = await request(server)
        .post('/api/users/watchlist/invalid-id')
        .set('x-auth-token', token);
      expect(res.status).toBe(400);
      expect(res.text).toBe('Invalid Player ID.');
    });

    it('should return 404 if player with playerId does not exist', async () => {
      const nonExistentPlayerId = new mongoose.Types.ObjectId().toHexString();
      const res = await request(server)
        .post(`/api/users/watchlist/${nonExistentPlayerId}`)
        .set('x-auth-token', token);
      expect(res.status).toBe(404);
      expect(res.text).toBe('Player not found.');
    });

    it('should return 400 if player is already in the watchlist', async () => {
      await User.findByIdAndUpdate(userId, { $addToSet: { watchlist: samplePlayer._id } });
      const res = await request(server)
        .post(`/api/users/watchlist/${samplePlayer._id}`)
        .set('x-auth-token', token);
      expect(res.status).toBe(400);
      expect(res.text).toBe('Player already in watchlist.');
    });
  });

  // DELETE /api/users/watchlist/:playerId
  describe('DELETE /:playerId', () => {
    beforeEach(async () => {
      // Add player to watchlist first
      await User.findByIdAndUpdate(userId, { $addToSet: { watchlist: samplePlayer._id } });
    });

    it('should return 401 if client is not logged in', async () => {
      const res = await request(server).delete(`/api/users/watchlist/${samplePlayer._id}`);
      expect(res.status).toBe(401);
    });

    it('should remove a player from watchlist if valid and authenticated', async () => {
      const res = await request(server)
        .delete(`/api/users/watchlist/${samplePlayer._id}`)
        .set('x-auth-token', token);
      expect(res.status).toBe(200);
      const userInDb = await User.findById(userId);
      expect(userInDb.watchlist.map(id => id.toString())).not.toContain(samplePlayer._id.toString());
    });

    it('should return 400 if playerId is an invalid ObjectId for delete', async () => {
      const res = await request(server)
        .delete('/api/users/watchlist/invalid-id-for-delete')
        .set('x-auth-token', token);
      expect(res.status).toBe(400);
      expect(res.text).toBe('Invalid Player ID.');
    });

    it('should return 404 if player is not in the watchlist to begin with for delete', async () => {
      // otherPlayer was not added to watchlist in this describe's beforeEach
      const res = await request(server)
        .delete(`/api/users/watchlist/${otherPlayer._id}`)
        .set('x-auth-token', token);
      expect(res.status).toBe(404);
      expect(res.text).toBe('Player not in watchlist.');
    });
  });
});
