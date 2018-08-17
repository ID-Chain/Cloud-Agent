/**
 * IDChain Cloud Agent Logger
 */

const log = require('pino')({ level: process.env.LOG_LEVEL });
const middleware = require('express-pino-logger')({
    logger: log
});

module.exports = { log, middleware };
