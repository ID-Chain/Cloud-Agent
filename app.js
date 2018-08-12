/**
 * IdentityChain Agency
 * Main
 */
require('dotenv').config();
const express = require('express');
const YAML = require('yamljs');
//var firebase_admin = require('./firebase/server');

const swaggerUi = require('swagger-ui-express');
const swaggerDoc = YAML.load('./swagger.yaml');

const log = require('./util/log').log;
const pool = require('./pool');
const wallet = require('./wallet');
const middleware = require('./middleware');
const routes = require('./routes');

const app = express();

app.use(middleware.before);

//app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use('/agency/api/', routes);

app.use(middleware.after);

const server = app.listen(process.env.APP_PORT, process.env.APP_HOST, async () => {
    log.info('IDChain Agency API now up at %s:%s', server.address().address, server.address().port);
    // log.info('Access APIDocs at /agency/api/docs');

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
