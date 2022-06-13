const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type : String,
        minlength : 4,
        maxlength : 255,
        required : true
    },
    email:{
        type: String,
        minlength: 6,
        maxlength: 255,
        required: true,
        unique : true
    },
    password:{
        type : String,
        minlength : 8,
        maxlength : 255,
        required : true
    },
    isAdmin: Boolean
});

const User = mongoose.model('User', userSchema);

userSchema.methods.createAuthToken = function (){
    const token = jwt.sign(
    {
        _id: this._id,
        name: this._name,
        email: this._email,
        isAdmin: this.isAdmin
    },
    config.get("jwtPrivateKey")
    )
    return token;
};

function validateUser(user){
    const schema = {
        name: Joi.string().min(4).max(255).required(),
        email : Joi.string().min(6).max(255).required(),
        password : Joi.string().min(8).max(255).required()
    }
    return Joi.validate(user, schema);
}

module.exports = User;
module.exports = validateUser;
