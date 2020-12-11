require('dotenv').config();
const config = {
    mongo: {
        connectionString: process.env.MONGO_CONNECTION_STRING
    }
};

module.exports = config;
