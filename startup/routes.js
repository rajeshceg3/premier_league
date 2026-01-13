const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const loansRouter = require('../routes/loans');
const playersRouter = require('../routes/players');
const teamsRouter = require('../routes/teams');
const usersRouter = require('../routes/users');
const authRouter = require('../routes/auth');
const returnsRouter = require('../routes/returns');
const agentsRouter = require('../routes/agents');
const healthRouter = require('../routes/health');
const error = require('../middleware/error');

module.exports = function (app) {
  app.use(express.json());
  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'x-auth-token'],
    })
  );
  app.use(mongoSanitize());

  // General rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  // Stricter rate limiter for auth routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login/register attempts per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
  });

  app.use('/api/loans', loansRouter);
  app.use('/api/players', playersRouter);
  app.use('/api/teams', teamsRouter);
  // Separate routes for auth-related (registration) and other user routes (watchlist)
  app.use('/api/users', (req, res, next) => {
    // Apply authLimiter only to registration POST /api/users
    if (req.path === '/' && req.method === 'POST') {
      authLimiter(req, res, next);
    } else {
      next();
    }
  }, usersRouter);

  app.use('/api/auth', authLimiter, authRouter); // Login
  app.use('/api/returns', returnsRouter);
  app.use('/api/agents', agentsRouter);
  app.use('/api/health', healthRouter);

  app.use(error);
};
