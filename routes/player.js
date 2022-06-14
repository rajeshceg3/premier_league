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

})


