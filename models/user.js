const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 4,
    maxlength: 255,
    required: true,
  },
  email: {
    type: String,
    minlength: 6,
    maxlength: 255,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    minlength: 8,
    maxlength: 255,
    required: true,
  },
  isAdmin: Boolean,
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
});

userSchema.methods.createAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name, // Corrected: this._name to this.name
      email: this.email, // Corrected: this._email to this.email
      isAdmin: this.isAdmin,
    },
    config.get('jwtPrivateKey')
  );
  return token;
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = Joi.object({
    // Changed to Joi.object for modern Joi
    name: Joi.string().min(4).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(), // Added .email() validation
    password: Joi.string().min(8).max(255).required(),
    isAdmin: Joi.boolean(),
  });
  return schema.validate(user); // Changed to modern Joi validation
}

module.exports.User = User;
module.exports.validateUser = validateUser;
