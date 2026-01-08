const mongoose = require('mongoose');
const config = require('config');
const winston = require('winston');

module.exports = async function () {
  const db = config.get('db');
  // Only connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(db).then(() => winston.info(`Connected to ${db}...`));
  }
};
