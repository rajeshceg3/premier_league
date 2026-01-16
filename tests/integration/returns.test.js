const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server'); // Use MMS
const moment = require('moment');
const { Loan } = require('../../models/loan');
const { Player } = require('../../models/player');
const { User } = require('../../models/user');

let server;
let mongoServer;
let token;
let loan;
let playerId;
let agentId;
let loanId;

describe('/api/returns', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    // eslint-disable-next-line global-require
    server = require('../../index'); // Gets 'app'
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections
    await Loan.deleteMany({});
    await Player.deleteMany({});
    await User.deleteMany({});

    token = new User().createAuthToken(); // Correct method name: createAuthToken
    playerId = new mongoose.Types.ObjectId();
    agentId = new mongoose.Types.ObjectId();

    loan = new Loan({
      player: {
        _id: playerId,
        name: '12345',
        dailyLoanFee: 2,
      },
      agent: {
        _id: agentId,
        name: '12345',
        phone: '12345',
      },
      loaningTeam: {
        name: 'Loaning Team',
      },
      borrowingTeam: {
        name: 'Borrowing Team',
      },
      startDate: new Date(),
      endDate: moment().add(30, 'days').toDate(),
      loanDate: new Date(),
    });
    await loan.save();
    loanId = loan._id;
  });

  // No afterEach server.close() needed because we handle it in afterAll and keep server alive for performance

  const exec = () => {
    return request(server).post('/api/returns').set('x-auth-token', token).send({ loanId });
  };

  it('should return 400 if loanId is not provided', async () => {
    loanId = '';
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 404 if loan is not found', async () => {
    await Loan.deleteMany({});
    const res = await exec();
    expect(res.status).toBe(404);
  });

  it('should return 400 if return is already processed', async () => {
    loan.ReturnDate = new Date();
    await loan.save();
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 200 if request is valid', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  it('should set the returnDate if input is valid', async () => {
    await exec();
    const loanInDb = await Loan.findById(loan._id);
    const diff = new Date() - loanInDb.ReturnDate;
    expect(diff).toBeLessThan(10 * 1000); // within 10 seconds
  });

  it('should calculate the loan fee', async () => {
    loan.loanDate = moment().add(-7, 'days').toDate();
    await loan.save();

    await exec();

    const loanInDb = await Loan.findById(loan._id);
    expect(loanInDb.loanFee).toBe(14); // 7 days * $2
  });

  it('should return the loan if input is valid', async () => {
    const res = await exec();
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(['loanDate', 'ReturnDate', 'loanFee', 'player', 'agent'])
    );
  });
});
