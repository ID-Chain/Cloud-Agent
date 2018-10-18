/**
 * IDChain Agent REST API
 * Test Variables
 */

require('dotenv').config();
const request = require('supertest');

module.exports.serverURL = `http://${process.env.CA_APP_HOST}:${process.env.CA_APP_PORT}`;
module.exports.agent = request.agent(module.exports.serverURL);

module.exports.acceptHeader = { Accept: 'application/json' };
module.exports.contentHeader = { 'Content-Type': 'application/json' };
module.exports.bothHeaders = Object.assign({}, module.exports.acceptHeader, module.exports.contentHeader);
