const Joi = require('joi');
const mongoose = require('mongoose');
const moment = require('moment');
const JoiObjectId = require('joi-objectid')(Joi);

const loanSchema = new mongoose.Schema({
  agent: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 50,
      },
      phone: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 50,
      },
    }),
  },
  player: {
    type: new mongoose.Schema({
      name: {
        type: String,
        trim: true,
        required: true,
        minlength: 4,
        maxlength: 50,
      },
      dailyLoanFee: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
      },
    }),
    required: true,
  },
  loaningTeam: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 50,
      },
    }),
    required: true,
  },
  borrowingTeam: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 50,
      },
    }),
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  loanDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  ReturnDate: {
    type: Date,
  },
  loanFee: {
    type: Number,
    min: 0,
  },
});

loanSchema.statics.lookup = function (agentId, playerId) {
  return this.findOne({
    'agent._id': agentId,
    'player._id': playerId,
  });
};

loanSchema.methods.return = function () {
  this.ReturnDate = new Date();
  const duration = moment().diff(this.loanDate, 'days');
  this.loanFee = duration * this.player.dailyLoanFee;
};

const Loan = mongoose.model('Loan', loanSchema);

function validateLoan(loan) {
  const schema = Joi.object({
    agentId: JoiObjectId(),
    playerId: JoiObjectId().required(),
    loaningTeamId: JoiObjectId().required(),
    borrowingTeamId: JoiObjectId().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
  });
  return schema.validate(loan);
}

module.exports.Loan = Loan;
module.exports.validateLoan = validateLoan;
