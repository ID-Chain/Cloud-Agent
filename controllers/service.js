const shortid = require('shortid');
const indy = require('indy-sdk');

const wrap = require('../util/asyncwrap').wrap;
const log = require('../util/log').log;
const APIResult = require('../util/api-result');
const firebaseServer = require('../firebase/server');
const db = require('../persistence/db');

module.exports = {
    serve: wrap(async (req, res, next) => {
        let response = {};

        try {
            response = await handleRequest(req);
            // For testing purposes of LevelDB and Firebase
            const firebaseToken = await db.get(req.body.senderDid);
            const messageId = await firebaseServer.sendMessageToClient(firebaseToken, response);
            log.debug('messageId:', messageId);
            next(new APIResult(200, response), {
                status: 'Ok'
            });
        } catch (e) {
            if (e.message === 'Bad Request')
                next(new APIResult(400, { statusCode: 400, error: e.message, message: 'Service type unknown' }));
        }
    })
};

async function handleRequest(req) {
    switch (
        req.body.type // use some sort of pattern matching for this
    ) {
        case 'register':
            return await handleRegistrationReq(req);
        case 'getUrl':
            return await handleUrlRequest(req);
        default:
            throw new Error('Bad Request');
    }
}

async function handleRegistrationReq(req) {
    const senderDid = req.body.senderDid,
        senderKey = req.body.senderKey,
        data = req.body.data;

    try {
        await indy.storeTheirDid(req.wallet.handle, { did: senderDid, verkey: senderKey });
    } catch (err) {
        log.error(err);
    }

    await db.put(senderDid, data.token);
    const myDid = await db.get(req.wallet.config.id);
    const myVerKey = await indy.keyForLocalDid(req.wallet.handle, myDid);
    return {
        type: 'register',
        senderDid: myDid,
        verKey: myVerKey,
        data: 'Success'
    };
}

async function handleUrlRequest(req) {
    const senderDid = req.body.senderDid;
    const data = req.body.data;
    const targetDid = data.targetDid;
    const id = shortid.generate();
    await db.put(targetDid, senderDid);
    await db.put(id, targetDid);
    const myDid = await db.get(req.wallet.config.id);
    const myVerKey = await indy.keyForLocalDid(req.wallet.handle, myDid);

    return {
        type: 'getUrl',
        senderDid: myDid,
        verKey: myVerKey,
        data: JSON.stringify({
            inboxUrl: `http://${process.env.APP_HOST}:${process.env.APP_PORT}/agency/api/inbox/${id}`
        })
    };
}
