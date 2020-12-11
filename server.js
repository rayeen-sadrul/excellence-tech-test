const config = require('./config');
const mongoose = require('mongoose');
mongoose.promise = global.Promise;

const candidates = require('./routes/candidates');

// express framework init
const express = require('express');
const app = express();

// json middleware
app.use(express.json());

// route load
app.use('/api/candidates', candidates);

// mongo db connection
mongoose.connect(config.mongo.connectionString, { useNewUrlParser: true })
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to mongoDB...',err));

// server up
const port = process.env.PORT || 3000;
const server = app.listen(port, ()=> console.log(`Listening on port ${port}...`));

module.exports = server;
