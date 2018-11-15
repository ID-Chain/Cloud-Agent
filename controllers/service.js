const fs = require('fs');
const uuid = require('uuid/v4');
const indy = require('indy-sdk');

const db = require('../persistence/db');
const lib = require('../lib');
const log = require('../util/log').log;
const wrap = require('../util/asyncwrap').wrap;
const APIResult = require('../util/api-result');

const pool_path = `${__dirname}/../${pool.config.genesis_txn}`
const pool_info = fs.readFileSync(pool_path, 'utf8');
const http_secured = process.env.SSL ? 'http://' : 'https://';
const ENDPOINT_PATH = `${http_secured}${process.env.DOMAIN_HOST}:${process.env.DOMAIN_PORT}/ca/api/indy/`;

module.exports = {
    serve: wrap(async (req, res, next) => {
        try {
            const response = await handleRequest(req);
            next(APIResult.created(response));
        } catch (e) {
            if (e.message === 'Bad Request') {
                next(new APIResult(400, { message: 'Service type unknown' }, e));
            } else {
                next(new APIResult(500, { message: e.message }, e));
            }
        }
    })
};

async function handleRequest(req) {
    const senderDid = req.body.endpoint_did,
        senderKey = req.body.verkey,
        token = req.body.endpoint;
    let myEndpointDid;
    try {
        await lib.sdk.storeTheirDid(req.wallet.handle, { did: senderDid, verkey: senderKey });
    } catch (err) {
        log.error(err);
    }

    let obj, id;
    try {
        // Token Update
        obj = await db.get(senderDid);
        obj.token = token;
        obj.verkey = senderKey;
        id = obj.urlid;
        await db.put(senderDid, obj);
    } catch (err) {
        // First registration
        id = uuid();
        obj = { urlid: id, token: token };
        await db.put(senderDid, obj);
        await db.put(id, senderDid);
    }

    const caEndpoint = await db.get(req.wallet.config.id);
    myEndpointDid = caEndpoint.did;
    
    return {
        endpoint_did: myEndpointDid,
        endpoint: ENDPOINT_PATH + id,
        pool_config: { pool_name: pool.name, pool_transactions_genesis: pool_info }
    };
}
