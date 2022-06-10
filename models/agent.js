const Joi = require('joi')
const mongoose = require('mongoose')

const agentSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        minlength : 4,
        maxlength : 50
    },
    phone:{
        type: String,
        required: true,
        minlength: 4,
        maxlength: 50
    },
    isPremium:{
        type : Boolean,
        default : false
    }
});

const Agent = mongoose.model('Agent', agentSchema);

function validateAgent(agent){
    const schema = {
        name: Joi.string().min(4).max(50).required(),
        phone: Joi.string().min(4).max(50).required(),
        isPremium: Joi.boolean()
    };

    return Joi.validate(agent, schema);

    module.exports = Agent;
    module.exports = validateAgent;
}