const mongoose = require('mongoose')
const Joi = require('joi')
const express = require('express')
const router = express.Router()
const { Team, validateTeam } = require("../models/team")

router.get("/", async (req, res) =>{
    const teams = await Team.find()
        .select("-__v")
        .sort("name");  
    res.send(teams);
});

router.post("/", async (req,res) => {
    const { error } =  validateTeam(req.body);
    if (error) return res.status(400).send(error.details[0].message);

   const team = new Team({
        name : req.body.name
   });
   
   await team.save();
   res.send(team);
})

router.put("/:id", async (req, res) => {
    const {error} = validateTeam(req.body);
    if( error ) return res.status(400).send(error.details[0].message);

    const team = await Team.findByIdAndUpdate(
        req.params.id,
        {
            name : req.body.name,
        },
        {
            new:true
        }
    );
    
    if (!team) return res.status(404).send("Team ID not found")
    res.send(team);
})

router.delete("/:id", async ( req, res )=>{
    const team = await Team.findByIdAndRemove(req.params.id);
    if (!team) return res.status(404).send("Team ID not found");
    res.send(team);
})

router.get("/:id", async (req,res)=>{
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).send("Team ID not found");
    res.send(team);
})

module.exports = router;

