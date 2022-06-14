const { Player, validatePlayer } = require("../models/player")
const { Team } = require("../models/team")
const moment = require('moment')
const mongoose = require('mongoose')
const Joi = require('joi')
const express = require('express')
const router = express.Router()

router.get("/", async (req, res) =>{
    const players = await Movie.find()
        .select("-__v")
        .sort("name");
    
    res.send(players);
});

router.post("/", async (req,res) => {
    const { error } =  validatePlayer(req.body);
    if (error) return res.status(400).send(error.details[0].message);

   const team = await Team.findById(req.body.teamId);
   if (!team) return res.status(400).send("Team name is not valid"); 

   const player = new Player({
    name : req.body.name,
    team : {
        _id : team._id,
        name : team.name
    },
    playerCount : req.body.playerCount,
    loanCost : req.body.loanCost,
    timeStamp : moment.toJSON()
   });
   
   await player.save();
   res.send(player);
})


