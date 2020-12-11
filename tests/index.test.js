const mongoUrl = "mongodb://localhost/excellence_test_db";
process.env.MONGO_CONNECTION_STRING = mongoUrl;

const app = require('../server');
const supertest = require('supertest');
const request = supertest(app);


const mongoose = require('mongoose');
mongoose.promise = global.Promise;


beforeAll(async () => {
    await mongoose.connect(mongoUrl, { useNewUrlParser: true });
});
afterAll(async () => {
    const collections = Object.keys(mongoose.connection.collections);
    for(const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName];
        try {
            await collection.drop();
        } catch(error) {
            console.log(error);
        }
    }
    await mongoose.connection.close();
    app.close();
});

describe('/api/candidates', () => {
    let candidateId;
    let candidateId2;
    describe('POST /', () => {
        it('Should create a candidate', async done => {
            // candidate 1
            let randomInt = Math.floor(Math.random() * Math.floor(9999));
            let res = await request.post('/api/candidates').send({
                email: `test${randomInt}@gmail.com`,
                name: `test${randomInt}`
            });
            candidateId = res.body._id;
            expect(res.body._id).toBeTruthy();
            expect(res.body.name).toBeTruthy();
            expect(res.body.email).toBeTruthy();
            expect(res.status).toBe(200);

            // candidate 2
            randomInt = Math.floor(Math.random() * Math.floor(9999));
            res = await request.post('/api/candidates').send({
                email: `test${randomInt}@gmail.com`,
                name: `test${randomInt}`
            });
            candidateId2 = res.body._id;
            expect(res.body._id).toBeTruthy();
            expect(res.body.name).toBeTruthy();
            expect(res.body.email).toBeTruthy();
            expect(res.status).toBe(200);

            done();
        });
    });

    describe('POST /:candidateId/scores', () => {
        it('Should create candidate first round score', async done => {
            // score for round 1 for candidate 1
            let res = await request.post(`/api/candidates/${candidateId}/scores`).send({
                round: "first",
                score: 10
            });
            expect(res.body._id).toBeTruthy();
            expect(res.body.candidateId).toBeTruthy();
            expect(res.body.tests).toBeTruthy();
            expect(res.status).toBe(200);

            // score for round 1 for candidate 2
            res = await request.post(`/api/candidates/${candidateId2}/scores`).send({
                round: "first",
                score: 7
            });
            expect(res.body._id).toBeTruthy();
            expect(res.body.candidateId).toBeTruthy();
            expect(res.body.candidateId).toBe(candidateId2);
            expect(res.body.tests).toBeTruthy();
            expect(res.status).toBe(200);
            done();
        });

        it('Should create candidate second round score', async done => {
            //score for round 2 for candidate 1
            let res = await request.post(`/api/candidates/${candidateId}/scores`).send({
                round: "second",
                score: 9
            });
            expect(res.body._id).toBeTruthy();
            expect(res.body.candidateId).toBeTruthy();
            expect(res.body.tests).toBeTruthy();
            expect(res.status).toBe(200);


            //score for round 2 for candidate 2
            res = await request.post(`/api/candidates/${candidateId2}/scores`).send({
                round: "second",
                score: 9
            });
            expect(res.body._id).toBeTruthy();
            expect(res.body.candidateId).toBeTruthy();
            expect(res.body.candidateId).toBe(candidateId2);
            expect(res.body.tests).toBeTruthy();
            expect(res.status).toBe(200);
            done();
        });

        it('Should create candidate third round score', async done => {
            //score for round 3 for candidate 1
            let res = await request.post(`/api/candidates/${candidateId}/scores`).send({
                round: "third",
                score: 7
            });
            expect(res.body._id).toBeTruthy();
            expect(res.body.candidateId).toBeTruthy();
            expect(res.body.tests).toBeTruthy();
            expect(res.status).toBe(200);

            //score for round 3 for candidate 2
            res = await request.post(`/api/candidates/${candidateId2}/scores`).send({
                round: "third",
                score: 9
            });
            expect(res.body._id).toBeTruthy();
            expect(res.body.candidateId).toBeTruthy();
            expect(res.body.candidateId).toBe(candidateId2);
            expect(res.body.tests).toBeTruthy();
            expect(res.status).toBe(200);

            done();
        });
    });

    describe('GET /', () => {
        it('Should return all candidates', async done => {
            const res = await request.get('/api/candidates');
            expect(res.status).toBe(200);

            done();
        });
    });

    // max
    describe('GET /', () => {
        it('Should return max score candidate per round', async done => {
            const res = await request.get('/api/candidates/scores?round=first&limit=1')
            expect(res.status).toBe(200);
            expect(res.body[0].tests[0].score).toBe(10);
            expect(res.body[0].candidateId).toBe(candidateId);

            done();
        });
    });

    // average
    describe('GET /', () => {
        it('Should return average score per round for all candidates', async done => {
            const res = await request.get('/api/candidates/scores/average?round=first')
            expect(res.status).toBe(200);
            expect(res.body[0].averageScore).toBe(8.5);

            done();
        });
    });
});
