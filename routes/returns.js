const express = require('express');
const router = express.Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi); // Initialize joi-objectid
const { Loan } = require('../models/loan'); // Destructure Loan model

// POST /api/returns - Process a loan return
router.post('/', async (req, res) => {
    // Validate the request body for loanId
    const { error } = validateReturn(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Find the loan by ID
    const loan = await Loan.findById(req.body.loanId);
    if (!loan) return res.status(404).send('Loan not found.');

    // Check if the loan has already been returned
    if (loan.ReturnDate) {
        return res.status(400).send('Loan already processed/returned.');
    }

    // Process the return using the instance method from the model
    loan.return(); // This sets ReturnDate and calculates loanFee

    // Save the updated loan record
    await loan.save();

    // Respond with the updated loan object
    res.send(loan);
});

// Local validation function for the return request
function validateReturn(requestBody) {
    const schema = Joi.object({
        loanId: Joi.objectId().required()
    });
    return schema.validate(requestBody);
}

module.exports = router;
