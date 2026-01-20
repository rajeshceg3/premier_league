const winston = require('winston');
require('express-async-errors');

module.exports = function () {
  // Handle exceptions: Console (JSON for Prod, Colorized for Dev) + File
  winston.exceptions.handle(
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production'
        ? winston.format.json()
        : winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    new winston.transports.File({ filename: 'uncaughtExceptions.log' })
  );

  process.on('unhandledRejection', (ex) => {
    throw ex;
  });

  // Always log to file (legacy/backup)
  winston.add(
    new winston.transports.File({
      filename: 'logfile.log',
      format: winston.format.json(),
    })
  );

  // Console Logging Strategy
  if (process.env.NODE_ENV !== 'production') {
    // Development: Human-readable, colorized
    winston.add(
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      })
    );
  } else {
    // Production: Machine-readable (JSON) for log aggregators (ELK, Splunk, Datadog)
    winston.add(
      new winston.transports.Console({
        format: winston.format.json(),
      })
    );
  }
};
