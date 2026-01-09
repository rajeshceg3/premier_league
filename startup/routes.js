const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const loansRouter = require('../routes/loans');
const playersRouter = require('../routes/players');
const teamsRouter = require('../routes/teams');
const usersRouter = require('../routes/users');
const authRouter = require('../routes/auth');
const returnsRouter = require('../routes/returns');
const agentsRouter = require('../routes/agents');
const error = require('../middleware/error');

module.exports = function (app) {
  app.use(express.json());
  app.use(helmet());
  app.use(compression());
  app.use(cors());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  app.use('/api/loans', loansRouter);
  app.use('/api/players', playersRouter);
  app.use('/api/teams', teamsRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/returns', returnsRouter);
  app.use('/api/agents', agentsRouter);

  app.use(error);
};
