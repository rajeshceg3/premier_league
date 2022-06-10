const Joi = require('joi')
const moongoose = require('mongoose')
const moment = require('moment')
const { default: mongoose } = require('mongoose')

const loanSchema = new mongoose.Schema({
    customer:{
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
            monthlyLoanFee:{
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

loanSchema.statics.lookup = function(customerID, playerId){
    return this.findOne({
        'customer._id': customerID,
        'player._id': playerId
    });
}

