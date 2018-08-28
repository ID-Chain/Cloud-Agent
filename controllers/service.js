const uuid = require('uuid/v4');
const indy = require('indy-sdk');

const wrap = require('../util/asyncwrap').wrap;
const log = require('../util/log').log;
const APIResult = require('../util/api-result');
const db = require('../persistence/db');
const http_secured = (process.env.SSL)? 'http://' : 'https://';
const ENDPOINT_PATH=`${http_secured}${process.env.DOMAIN_HOST}:${process.env.DOMAIN_PORT}/ca/api/indy/`;


module.exports = {
    serve: wrap(async (req, res, next) => {
        let response = {};

        try {
            response = await handleRequest(req);
            next(new APIResult(201, response), {
                status: 'Ok'
            });
        } catch (e) {
            if (e.message === 'Bad Request')
                next(new APIResult(400, { statusCode: 400, error: e.message, message: 'Service type unknown' }));
            else next(new APIResult(next(400, { statusCode: 500, error: e.message, message: e.message })))
        }
    })
};

async function handleRequest(req){
    const senderDid = req.body.endpoint_did,
          senderKey = req.body.verkey,
          token = req.body.endpoint;
    let myEndpointDid;
    try {
        await indy.storeTheirDid(req.wallet.handle, { did: senderDid, verkey: senderKey });
    } catch (err) {
        log.error(err);
    }

    let obj, id;
    try {
        // Token Update
        obj = await db.get(senderDid);
        obj.token = token;
        id = obj.urlid;
        await db.put(senderDid, obj);
    } catch(err){
        // First registration
        id = uuid();
        obj = {urlid:id, token: token}
        await db.put(senderDid, obj);
        await db.put(id, senderDid);
    } 
   
     const  caEndpoint = await db.get(req.wallet.config.id);
     myEndpointDid = caEndpoint.did;

    return {
        endpoint_did: myEndpointDid,
        endpoint: ENDPOINT_PATH+id
    };
}
