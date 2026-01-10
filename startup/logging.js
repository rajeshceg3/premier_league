const winston = require('winston');
require('express-async-errors');

module.exports = function () {
  winston.exceptions.handle(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'uncaughtExceptions.log' })
  );

  process.on('unhandledRejection', (ex) => {
    throw ex;
  });

  winston.add(
    new winston.transports.File({
      filename: 'logfile.log',
      format: winston.format.json(),
    })
  );

  // Console logging for development
  if (process.env.NODE_ENV !== 'production') {
    winston.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      })
    );
  }
};
