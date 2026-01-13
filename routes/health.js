const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.send({
    status: 'UP',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
