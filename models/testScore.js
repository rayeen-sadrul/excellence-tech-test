//const { number } = require('joi');
const Joi = require('joi');
const mongoose = require('mongoose');
const Candidate = require('./candidate');

const TestScore = mongoose.model('testScores', new mongoose.Schema({
    candidateId:{
        type: Candidate,
        required: true
    },
    tests:[{
        round: {
            type: String,
            required: true,
            unique: true
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 10
        }
    }]
}));

function validateScore(testScore) {
    const schema = Joi.object({
        candidateId: Joi.string().required(),
        round: Joi.string().required(),
        score: Joi.Number().min(0).max(10).required() 
    });
    return schema.validate(testScore);
}

exports.TestScore = TestScore;
exports.validate = validateScore;