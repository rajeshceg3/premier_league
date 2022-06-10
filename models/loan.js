const Joi = require('joi')
const moongoose = require('mongoose')
const moment = require('moment')
const { default: mongoose } = require('mongoose')

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
    this.dateReturned = new Date();
    const duration = moment.diff(this.loanDate, 'days');
    this.loanFee = duration*this.player.dailyLoanFee;
}

const Loan = mongoose.model('Loan', loanSchema);

function validateLoan(loan){

    const schema = {
        agentId: Joi.objectId().required(),
        playerId: Joi.objectId().required()
    } 
    return Joi.validate(loan, schema);
}

module.exports = Loan;
module.exports = validateLoan;


