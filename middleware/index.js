
const cors = require('cors');
const bodyParser = require('body-parser');

const logMiddleware = require('../util/log').middleware;
const validation = require('./validate');
const notFound = require('./404');
const {resultMiddleware, errorMiddleware} = require('./result');

module.exports = {
  before: [
    cors(),
    logMiddleware,
    bodyParser.json(),
    validation,
  ],

  after: [
    notFound,
    resultMiddleware,
    errorMiddleware,
  ],
};
