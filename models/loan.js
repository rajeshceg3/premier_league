const Joi = require('joi')
const mongoose = require('mongoose');
const moment = require('moment');

const loanSchema = new mongoose.Schema({
    agent:{
        type : new mongoose.Schema({
            name:{
                type: String,
                required : true,
                minlength : 4,
                maxlength : 50
            },
            phone:{
                type: String,
                required : true,
                minlength : 4,
                maxlength : 50
            }
        })
    },
    player:{
        type : new mongoose.Schema({
            name : {
                type : String,
                trim : true,
                required: true,
                minlength : 4,
                maxlength : 50
            },
            dailyLoanFee:{
                type : Number,
                required: true,
                min: 0,
                max: 255
            }
        }),
        required: true
    },
    loanDate:{
        type : Date,
        required: true,
        default : Date.now
    },
    ReturnDate:{
        type:Date
    },
    loanFee:{
        type: Number,
        min : 0
    }
});

loanSchema.statics.lookup = function(agentId, playerId){
    return this.findOne({
        'agent._id': agentId,
        'player._id': playerId
    });
}

loanSchema.methods.return = function(){
    this.ReturnDate = new Date(); // Corrected to match schema: ReturnDate
    const duration = moment().diff(this.loanDate, 'days'); // Calculate duration until now
    this.loanFee = duration * this.player.dailyLoanFee;
}

const Loan = mongoose.model('Loan', loanSchema);

function validateLoan(loan){
    const JoiObjectId = require('joi-objectid')(Joi); // Initialize joi-objectid
    const schema = Joi.object({ // Use Joi.object() for modern Joi
        agentId: JoiObjectId().required(), // Use JoiObjectId for validation
        playerId: JoiObjectId().required()
    });
    return schema.validate(loan); // Use schema.validate()
}

module.exports.Loan = Loan;
module.exports.validateLoan = validateLoan;


