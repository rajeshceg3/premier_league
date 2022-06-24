import { Loan, validateLoan } from '../models/loan';
import { Player } from '../models/player';
import { Agent } from '../models/agent';
import mongoose from 'mongoose';
import { Router } from 'express';
import Fawn from 'fawn';
const router = Router();

Fawn.init(mongoose)

router.get("/", async ( req, res)=>{
    const loan = await Loan.find()
                            .select("-__v")
                            .sort("-loanDate");
                    
    res.send(loan);
})

router.post("/", async (req, res)=>{
    const {error} = validateLoan(req.body);
    if (error) res.status(400).send(error.details[0].message);

    const agent = await Agent.findById(req.body.agentId);
    if (!agent) res.status(400).send("Agent ID not found");

    const player = await Player.findById(req.body.playerId);
    if (!player) res.status(400).send("Player ID not found");

    if(player.loanDaysRemaining === 0)
        return res.status(400).send("Player not available for loan");

    const loan = new Loan({
        agent: {
            _id : agent._id,
            name : agent.name,
            phone : agent.phone
        },
        player: {
            _id: player._id,
            name : player.name,
            dailyLoanFee: player.dailyLoanFee
        }
    });

    try{
        new Fawn.Task()
            .save("loans", loan )
            .update("players",
            {
                _id : player._id
            },
            {
                $inc : { loanDaysRemaining : -1 }
            }
            )
            .run();
        res.send(loan);
    }
    catch(ex){
        res.status(500).send("Operation Didn't succeed");
    }
})

router.get("/:id", async(req,res)=>{
   const loan = await Loan.findById(req.params.id).select("-__v");
   if(!loan) res.status(404).send("Player with given id not found");
   res.send(loan);
})

module.exports = router;
