const express = require('express');
const mongoose = require('mongoose');
const { Agent, validateAgent } = require('../models/agent');

const router = express.Router();

// GET /api/agents - Get all agents
router.get('/', async (req, res) => {
  const agents = await Agent.find().select('-__v').sort('name');
  res.send(agents);
});

// POST /api/agents - Create a new agent
router.post('/', async (req, res) => {
  const { error } = validateAgent(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let agent = new Agent({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    isPremium: req.body.isPremium, // isPremium is optional, defaults to false if not provided
  });
  agent = await agent.save();
  res.send(agent);
});

// GET /api/agents/:id - Get a specific agent by ID
router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send('Invalid Agent ID.');
  }
  const agent = await Agent.findById(req.params.id).select('-__v');
  if (!agent) return res.status(404).send('The agent with the given ID was not found.');
  res.send(agent);
});

// PUT /api/agents/:id - Update an existing agent by ID
router.put('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send('Invalid Agent ID.');
  }

  const { error } = validateAgent(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const agent = await Agent.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      isPremium: req.body.isPremium,
    },
    { new: true } // Return the updated document
  ).select('-__v');

  if (!agent) return res.status(404).send('The agent with the given ID was not found.');
  res.send(agent);
});

// DELETE /api/agents/:id - Delete an agent by ID
router.delete('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send('Invalid Agent ID.');
  }
  const agent = await Agent.findByIdAndDelete(req.params.id).select('-__v');
  if (!agent) return res.status(404).send('The agent with the given ID was not found.');
  res.send(agent); // Conventionally, the deleted object is returned
});

module.exports = router;
