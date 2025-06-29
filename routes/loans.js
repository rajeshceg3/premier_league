const mongoose = require('mongoose');
const router = require('express').Router();
const Fawn = require('fawn');
const { Loan, validateLoan } = require('../models/loan');
const { Player } = require('../models/player');
const { Agent } = require('../models/agent'); // Corrected: Agent is a property of the exported object

Fawn.init(mongoose); // Added semicolon for consistency

router.get('/', async (req, res) => {
  const loan = await Loan.find().select('-__v').sort('-loanDate');

  res.send(loan);
});

router.post('/', async (req, res) => {
  const { error } = validateLoan(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  const agent = await Agent.findById(req.body.agentId);
  if (!agent) {
    res.status(400).send('Agent ID not found');
    return;
  }

  const player = await Player.findById(req.body.playerId);
  if (!player) {
    res.status(400).send('Player ID not found');
    return;
  }

  if (player.loanDaysRemaining === 0) {
    res.status(400).send('Player not available for loan');
    return;
  }

  const loan = new Loan({
    agent: {
      _id: agent._id,
      name: agent.name,
      phone: agent.phone,
    },
    player: {
      _id: player._id,
      name: player.name,
      dailyLoanFee: player.loanCost, // Ensure this uses player.loanCost
    },
  });

  try {
    new Fawn.Task()
      .save('loans', loan)
      .update(
        'players',
        {
          _id: player._id,
        },
        {
          $inc: { loanDaysRemaining: -1 },
        }
      )
      .run();
    res.send(loan);
  } catch (ex) {
    res.status(500).send("Operation Didn't succeed");
    return;
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
