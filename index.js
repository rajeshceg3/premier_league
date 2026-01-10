const config = require('config');
const express = require('express');

const app = express();
const winston = require('winston');

require('./startup/logging')();
require('./startup/config')();
require('./startup/routes')(app);
require('./startup/db')();

// Startup check for jwtPrivateKey
if (!config.get('jwtPrivateKey')) {
  winston.error('FATAL ERROR: jwtPrivateKey is not defined.');
  process.exit(1);
}

const port = process.env.PORT || config.get('port');

let server;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    winston.info(`Server listening for requests on port ${port}`);
  });
}

module.exports = server || app; // Export server if running, else app
