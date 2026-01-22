const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const users = require('../routes/users');
const teams = require('../routes/teams');
const players = require('../routes/players');
const agents = require('../routes/agents');
const loans = require('../routes/loans');
const returns = require('../routes/returns');
const error = require('../middleware/error');

module.exports = function routes(app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(compression());
  app.use(helmet());
  app.use(mongoSanitize());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  app.use('/api/users', users);
  app.use('/api/teams', teams);
  app.use('/api/players', players);
  app.use('/api/agents', agents);
  app.use('/api/loans', loans);
  app.use('/api/returns', returns);

  // Serve static files from the React app
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    // Handle React routing, return all requests to React app
    // EXCLUDING API routes (which should have been handled above or fall through to 404)
    app.get('*', (req, res, next) => {
      // If the request is for an API endpoint that wasn't found above, allow it to fall through to the error handler
      // or return a JSON 404. Since we defined API routes above, anything starting with /api here is a 404.
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
  }

  app.use(error);
};
