const winston = require('winston');

// eslint-disable-next-line no-unused-vars
module.exports = function (err, req, res, next) {
  // Log metadata
  winston.error(err.message, {
    metadata: {
      method: req.method,
      url: req.originalUrl,
      stack: err.stack,
    },
  });

  res.status(500).send('Something failed.');
};
