const mongoose = require('mongoose');
const router = require('express').Router();
const { Loan, validateLoan } = require('../models/loan');
const { Player } = require('../models/player');
const { Agent } = require('../models/agent');
const { Team } = require('../models/team');

router.get('/', async (req, res) => {
  const pageNumber = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.limit) || 10;
  const skip = (pageNumber - 1) * pageSize;

  const loans = await Loan.find()
    .select('-__v')
    .sort('-loanDate')
    .skip(skip)
    .limit(pageSize);

  const total = await Loan.countDocuments();

  res.send({
    items: loans,
    totalItems: total,
    currentPage: pageNumber,
    totalPages: Math.ceil(total / pageSize),
  });
});

router.post('/', async (req, res) => {
  const { error } = validateLoan(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  let agent;
  if (req.body.agentId) {
    agent = await Agent.findById(req.body.agentId);
    if (!agent) {
      res.status(400).send('Agent ID not found');
      return;
    }
  }

  const player = await Player.findById(req.body.playerId);
  if (!player) {
    res.status(400).send('Player ID not found');
    return;
  }

  const loaningTeam = await Team.findById(req.body.loaningTeamId);
  if (!loaningTeam) {
    res.status(400).send('Loaning Team ID not found');
    return;
  }

  const borrowingTeam = await Team.findById(req.body.borrowingTeamId);
  if (!borrowingTeam) {
    res.status(400).send('Borrowing Team ID not found');
    return;
  }

  if (player.loanDaysRemaining === 0) {
    res.status(400).send('Player not available for loan');
    return;
  }

  const loanData = {
    player: {
      _id: player._id,
      name: player.name,
      dailyLoanFee: player.loanCost,
    },
    loaningTeam: {
      _id: loaningTeam._id,
      name: loaningTeam.name,
    },
    borrowingTeam: {
      _id: borrowingTeam._id,
      name: borrowingTeam.name,
    },
    startDate: req.body.startDate,
    endDate: req.body.endDate,
  };

  if (agent) {
    loanData.agent = {
      _id: agent._id,
      name: agent.name,
      phone: agent.phone,
    };
  }

  const loan = new Loan(loanData);

  // Replaced Fawn with native transactions or sequential operations
  // Note: For true ACID transactions, a Replica Set is required.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await loan.save({ session });
    await Player.updateOne({ _id: player._id }, { $inc: { loanDaysRemaining: -1 } }, { session });

    await session.commitTransaction();
    res.send(loan);
  } catch (ex) {
    await session.abortTransaction();
    // Check if error is due to standalone mongo (no transactions)
    if (
      ex.message &&
      (ex.message.includes('Transactions are not supported') ||
        ex.message.includes('Transaction numbers are only allowed'))
    ) {
      // Fallback for standalone (e.g. dev/test without replset)
      await loan.save();
      await Player.updateOne({ _id: player._id }, { $inc: { loanDaysRemaining: -1 } });
      res.send(loan);
    } else {
      throw ex;
    }
  } finally {
    session.endSession();
  }
});

router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).send('Invalid Loan ID.');
    return;
  }
  const loan = await Loan.findById(req.params.id).select('-__v');
  if (!loan) {
    res.status(404).send('Loan with given ID not found');
    return;
  }
  res.send(loan);
});

module.exports = router;
