const shortid = require('shortid');
const indy = require('indy-sdk');

const wrap = require('../util/asyncwrap').wrap;
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
            console.log('messageId:', messageId);
            // Get Message from Request Body
            // Decrypt Message based on senderDid
            // Get recipeintDid from Message Body
            // Find recipientDid in Level Database and return value of firebaseToken
            // Send Firebase GCM Message to Client like this
            // firebase.sendMessageToClient(message,firebaseToken)

            next(new APIResult(200, response), {
                status: 'Ok'
            });
        } catch (e) {
            if (e.message === 'Bad Request')
                next(new APIResult(400, { statusCode: 400, error: e.message, message: 'Service type unknown' }));
        }
    }),

    retrieve: wrap(async (req, res, next) => {
        console.log('GET request received');

        const firebaseToken = await db.get(req.params.did);

        next(new APIResult(200, { firebaseToken: firebaseToken }), {
            status: 'Ok'
        });
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
    await indy.storeTheirDid(req.wallet.handle, { did: senderDid, verkey: senderKey });
    await db.put(senderDid, data.token);
    const myDid = await db.get(req.wallet.config.id);
    const verKey = await indy.keyForLocalDid(req.wallet.handle, myDid);
    return {
        type: 'register',
        senderDid: myDid,
        verKey: verKey,
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
    const verKey = await indy.keyForLocalDid(req.wallet.handle, myDid);

    return {
        type: 'getUrl',
        senderDid: myDid,
        verKey: verKey,
        data: JSON.stringify({
            inboxUrl: `http://${process.env.APP_HOST}:${process.env.APP_PORT}/agency/api/inbox/${id}`
        })
    };
}
