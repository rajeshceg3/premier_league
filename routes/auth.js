const bcrypt = require('bcrypt');
const { User } = require('../models/user'); // Only User model is needed here
const Joi = require('joi');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    // Validate the request body
    const { error } = validateAuth(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Find the user by email
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password.'); // Generic message

    // Compare the provided password with the stored hashed password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password.'); // Generic message

    // If valid, generate a JWT token
    const token = user.createAuthToken();
    res.send(token); // Respond with the JWT token
});

// Local Joi validation schema for authentication
function validateAuth(req) {
    const schema = Joi.object({
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(8).max(255).required()
    });
    return schema.validate(req);
}

module.exports = router;
