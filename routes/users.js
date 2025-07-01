const bcrypt = require('bcrypt');
const express = require('express');
const _ = require('lodash'); // For _.pick
const mongoose = require('mongoose'); // Added for ObjectId validation
const auth = require('../middleware/auth'); // Added auth middleware
const { Player } = require('../models/player'); // Added Player model
const { User, validateUser } = require('../models/user');

const router = express.Router();

// GET current user's watchlist
router.get('/watchlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('watchlist');
    if (!user) return res.status(404).send('User not found.');

    res.send(user.watchlist);
  } catch (error) {
    res.status(500).send('Error fetching watchlist.');
  }
});

// POST to add a player to the watchlist
router.post('/watchlist/:playerId', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.playerId)) {
      return res.status(400).send('Invalid Player ID.');
    }

    const player = await Player.findById(req.params.playerId);
    if (!player) return res.status(404).send('Player not found.');

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send('User not found.');

    if (user.watchlist.includes(player._id)) {
      return res.status(400).send('Player already in watchlist.');
    }

    user.watchlist.push(player._id);
    await user.save();
    res.send(user.watchlist);
  } catch (error) {
    res.status(500).send('Error adding player to watchlist.');
  }
});

// DELETE a player from the watchlist
router.delete('/watchlist/:playerId', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.playerId)) {
      return res.status(400).send('Invalid Player ID.');
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send('User not found.');

    const playerIndex = user.watchlist.indexOf(req.params.playerId);
    if (playerIndex === -1) {
      return res.status(404).send('Player not in watchlist.');
    }

    user.watchlist.splice(playerIndex, 1);
    await user.save();
    res.send(user.watchlist);
  } catch (error) {
    res.status(500).send('Error removing player from watchlist.');
  }
});

router.post('/', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['name', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.createAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});

module.exports = router;
