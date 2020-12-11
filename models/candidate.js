const Joi = require('joi');
const mongoose = require('mongoose');

const Candidate = mongoose.model('candidates', new mongoose.Schema({
    name:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    email:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    }
}));

function validateCandidate(candidate) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email()
    });
    return schema.validate(candidate);
}

exports.Candidate = Candidate;
exports.validate = validateCandidate;