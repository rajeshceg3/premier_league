const winston = require('winston');

// eslint-disable-next-line no-unused-vars
module.exports = function error(err, req, res, next) {
  // Log metadata
  winston.error(err.message, {
    metadata: {
      method: req.method,
      url: req.originalUrl,
      stack: err.stack,
    },
  });

  // Return JSON error for client-side consistency
  res.status(500).json({ message: 'Something failed.' });
};
