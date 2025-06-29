const moment = require('moment');
const express = require('express');
const mongoose = require('mongoose'); // Added for ObjectId validation
const { Team } = require('../models/team');
const { Player, validatePlayer } = require('../models/player');

const router = express.Router();

router.get('/', async (req, res) => {
  const players = await Player.find().select('-__v').sort('name');

  res.send(players);
});

router.post('/', async (req, res) => {
  const { error } = validatePlayer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const team = await Team.findById(req.body.teamId);
  if (!team) return res.status(400).send('Team name is not valid');

  const player = new Player({
    name: req.body.name,
    team: {
      _id: team._id,
      name: team.name,
    },
    loanDaysRemaining: req.body.loanDaysRemaining,
    loanCost: req.body.loanCost,
  });

  await player.save();
  res.send(player);
});

router.put('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).send('Invalid Player ID.');
    return;
  }
  const { error } = validatePlayer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const team = await Team.findById(req.body.teamId);
  if (!team) return res.status(400).send('Invalid Team details provided');

  const player = await Player.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      team: {
        _id: team._id,
        name: team.name,
      },
      loanDaysRemaining: req.body.loanDaysRemaining,
      loanCost: req.body.loanCost,
    },
    {
      new: true,
    }
  );

  if (!player) return res.status(404).send('Player ID not found');
  res.send(player);
});

router.delete('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).send('Invalid Player ID.');
    return;
  }
  const player = await Player.findByIdAndRemove(req.params.id);
  if (!player) return res.status(404).send('Player ID not found');
  res.send(player);
});

router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).send('Invalid Player ID.');
    return;
  }
  const player = await Player.findById(req.params.id);
  if (!player) return res.status(404).send('Player with given ID was not found.');
  res.send(player);
});

module.exports = router;
