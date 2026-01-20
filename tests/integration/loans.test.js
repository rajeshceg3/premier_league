const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Loan } = require('../../models/loan');
const { User } = require('../../models/user');

let server;
let mongoServer;

describe('/api/loans', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    server = require('../../index');
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Loan.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all loans (paginated default)', async () => {
      await Loan.collection.insertMany([
        {
            player: { name: 'Player1', dailyLoanFee: 1 },
            loaningTeam: { name: 'Team1' },
            borrowingTeam: { name: 'Team2' },
            startDate: new Date(), endDate: new Date()
        },
        {
            player: { name: 'Player2', dailyLoanFee: 2 },
            loaningTeam: { name: 'Team3' },
            borrowingTeam: { name: 'Team4' },
            startDate: new Date(), endDate: new Date()
        },
      ]);

      const res = await request(server).get('/api/loans');

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(2);
      expect(res.body.totalItems).toBe(2);
      expect(res.body.currentPage).toBe(1);
    });

    it('should implement pagination limit', async () => {
         await Loan.collection.insertMany([
            { player: { name: 'P1' }, loaningTeam: {name: 'T1'}, borrowingTeam: {name:'T2'}, startDate: new Date(), endDate: new Date() },
            { player: { name: 'P2' }, loaningTeam: {name: 'T1'}, borrowingTeam: {name:'T2'}, startDate: new Date(), endDate: new Date() },
            { player: { name: 'P3' }, loaningTeam: {name: 'T1'}, borrowingTeam: {name:'T2'}, startDate: new Date(), endDate: new Date() },
         ]);

         const res = await request(server).get('/api/loans?page=1&limit=2');
         expect(res.status).toBe(200);
         expect(res.body.items.length).toBe(2);
         expect(res.body.totalPages).toBe(2);
         expect(res.body.totalItems).toBe(3);
    });
  });
});
