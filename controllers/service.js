const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v4');

const pool = require('../lib/pool');
const db = require('../persistence/db');
const lib = require('../lib');
const log = require('../util/log').log;
const wrap = require('../util/asyncwrap').wrap;
const APIResult = require('../util/api-result');

const pool_path = path.resolve(`${__dirname}/../${pool.config.genesis_txn}`);
const http_secured = process.env.IDC_CA_SSL ? 'http://' : 'https://';
const ENDPOINT_PATH = `${http_secured}${process.env.IDC_CA_DOMAIN_HOST}:${process.env.IDC_CA_DOMAIN_PORT}/ca/api/indy/`;
let pool_info = "";

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
    if (!pool_info) pool_info = await fs.readFileSync(pool_path, 'utf8');
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
