const Joi = require('joi');
const mongoose = require('mongoose');
const teamSchema = require('./team')

const playerSchema =  new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        maxlength: 50
    },
    team:{
        type: teamSchema,
        required: true
    },
    loanDaysRemaining:{
        type: Number,
        required: true,
        min : 0,
        max : 255
    },
    loanCost:{
        type: Number,
        required : true,
        min : 0,
        max : 255
    }
});

const Player = mongoose.model('Player', playerSchema);

function validatePlayer(player){
    const schema = {
        name : Joi.string().min(4).max(50).required(), // Corrected Joi.String to Joi.string
        teamId : Joi.objectId().required(), // Corrected 'team' to 'teamId' to match common practice and request body
        loanDaysRemaining: Joi.number().min(0).required(),
        loanCost: Joi.number().min(0).required()
    }
    return Joi.validate(player, schema);
}

module.exports.Player = Player;
module.exports.validatePlayer = validatePlayer;