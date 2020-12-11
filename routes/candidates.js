const { Candidate, validate } = require('../models/candidate');
const { TestScore } = require('../models/testScore');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try{
        const candidates = await Candidate.find().sort('name');
        res.send(candidates);
    }
    catch(error) {
        res.status(400).json({
            success:'false',
            error: `${error.message}`
        });
    }
});
router.post('/', async (req, res) =>{
    try{
        const {error} = validate(req.body);
        if(error) {
            res.send(error);
        }
    }
    catch(error){
        res.status(400).json({
            success:'false',
            error: `${error.message}`
        });
    }
    let candidates = await Candidate.findOne({
        email: req.body.email
    });
    if(candidates){
        res.status(409).json({
            success: false,
            code: ' EmailConflictError',
            errors: `This email [${req.body.email}] already exist.`
        });
    }
    
    let candidate = new Candidate({
        name: req.body.name,
        email: req.body.email
    });
    candidate = await candidate.save();
    res.send(candidate);
});

router.post('/:candidateId/scores', async (req, res) => {
    try{
        await Candidate.findById(req.params.candidateId);
    }
    catch(error) {
        res.status(400).json({
            success: "false",
            error: 'Invalid candidate.'
        });
    }
    let testScore = await TestScore.findOne({ candidateId: req.params.candidateId });
    if(testScore) {
        const tests = testScore.tests;
        let isRoundFound = false;
        for(let i = 0; i < tests.length; i++) {
            const test = tests[i];
            if(test.round === req.body.round) {
                isRoundFound = true;
                break;
            }
        }
        if(isRoundFound) {
            res.status(400).json({
                success: "false",
                error: 'Round already exist.'
            });
        } else {
            testScore.tests.push({
                round: req.body.round,
                score: req.body.score
            });
        }

    } else {
        testScore = new TestScore({
            candidateId: req.params.candidateId,
            tests:[{
                round: req.body.round,
                score: req.body.score
            }]
        });
    }

    const result = await testScore.save();
    res.send(result);
});

// query string: ?round=first&limit=1
router.get('/scores', async(req, res) => {
    const result = await TestScore.find({ "tests.round": req.query.round }, {candidateId: 1, tests: {$elemMatch: {round: req.query.round}}}).sort({ "tests.score": -1 }).limit(parseInt(req.query.limit));
    
    res.send(result);
});

// query string: ?round=first
router.get('/scores/average', async(req, res) => {
    const result = await TestScore.aggregate([
    {
        $unwind: "$tests",
    },
    {
        $match: {"tests.round": req.query.round}
    },
    {
        "$group":{
            "_id": null,
            "averageScore": {"$avg": "$tests.score"}
        }
    }])
    res.send(result);
});

module.exports = router;
