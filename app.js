/**
 * IdentityChain Cloud Agent
 * Main
 */
require('dotenv').config();
const express = require('express');
const YAML = require('yamljs');

const swaggerUi = require('swagger-ui-express');
const swaggerDoc = YAML.load('./swagger.yaml');

const log = require('./util/log').log;
const pool = require('./lib/pool');
const wallet = require('./lib/wallet');
const middleware = require('./middleware');
const routes = require('./routes');

const app = express();

app.use(middleware.before);

app.use('/ca/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use('/ca/api/', routes);

app.use(middleware.after);

const server = app.listen(process.env.CA_APP_PORT, process.env.CA_APP_HOST, async () => {
    log.info('IDChain Cloud Agent API now up at %s:%s', server.address().address, server.address().port);
    log.info('Access APIDocs at /ca/api/docs');

    try {
        await pool.createConfig();
    } catch (err) {
        log.warn(err);
    }

    try {
        await pool.openLedger();
    } catch (err) {
        log.error(err);
        process.exit(1);
    }

    try {
        await wallet.createWallet();
    } catch (err) {
        log.error(err);
    }

});

module.exports = app;
