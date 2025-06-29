const Joi = require('joi');
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50,
  },
  coach: {
    type: String,
    required: true,
    minlength: 2, // Assuming a coach's name needs at least 2 characters
    maxlength: 50,
  },
});

const Team = mongoose.model('Team', teamSchema);

function validateTeam(team) {
  const schema = Joi.object({
    name: Joi.string().min(4).max(50).required(),
    coach: Joi.string().min(2).max(50).required(),
  });
  return schema.validate(team);
}

module.exports.Team = Team;
module.exports.validateTeam = validateTeam;
