const shortid = require('shortid');
const level = require('level');

const wrap = require('../util/asyncwrap').wrap;
const APIResult = require('../util/api-result');
const firebaseServer = require('../firebase/server');
const db = require('../persistence/db');

module.exports = {
    serve: wrap(async (req, res, next) => {
        const type = req.body.type;
        const senderDid = req.body.senderDid;
        const data = req.body.data;
        let response = {};
        try {
            response = await handleRequest(type, senderDid, data);
            const firebaseToken = await db.get(senderDid);
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

async function handleRequest(type, senderDid, data) {
    switch (
        type // use some sort of pattern matching for this
    ) {
        case 'register':
            return await handleRegistrationReq(senderDid, data);
        case 'getUrl':
            return await handleUrlRequest(senderDid, data);
        default:
            throw new Error('Bad Request');
    }
}

async function handleRegistrationReq(senderDid, data) {
    await db.put(senderDid, data.register);
    return {
        type: 'register',
        senderDid: 'putAgencyDidHere',
        data: 'Done'
    };
}

async function handleUrlRequest(senderDid, data) {
    const targetDid = data.targetDid;
    const id = shortid.generate();
    await db.put(targetDid, senderDid);
    //await db.put(targetDid, id);
    await db.put(id, targetDid);
    return {
        type: 'getUrl',
        senderDid: 'putAgencyDidHere',
        data: JSON.stringify({
            inboxUrl: `http:${process.env.APP_HOST}:${process.env.APP_PORT}/agency/api/inbox/${id}`
        })
    };
}
