const urlid = require('../util/urlid');
const wrap = require('../util/asyncwrap').wrap;
const APIResult = require('../util/api-result');
const firebaseServer = require('../firebase/server');
const db = require('../persistence/db');

module.exports = {
    forward: wrap(async (req, res, next) => {
        const id = req.params.id;
        const test = req.query.test;
        const message = req.body.message;

        let encodedMessage;
        if (!test) {
            const did = await db.get(req.wallet.config.id);
            const messageBuf = await req.wallet.anonDecrypt(did, message);
            const encryptedMessage = req.wallet.anonCrypt(senderDid, messageBuf);
            encodedMessage = Buffer.from(JSON.stringify(encryptedMessage)).toString('base64');
        } else {
            encodedMessage = Buffer.from(JSON.stringify(message)).toString('base64');
        }

        const targetDid = await db.get(id);
        const senderDid = await db.get(targetDid);
        const firebaseToken = await db.get(senderDid);

        const n = encodedMessage.length;
        const byteSize = 4 * Math.ceil(n / 3);
        let dataType;

        console.log('byte size of decrypted message:', byteSize);

        try {
            let messageToSent =
                byteSize < 4000
                    ? ((dataType = 'data'), encodedMessage)
                    : ((dataType = 'url'),
                      (urlId = urlid.generate()),
                      db.put(urlId, encodedMessage),
                      `http://${process.env.APP_HOST}:${process.env.APP_PORT}/agency/api/messages/${urlId}`);
            await firebaseServer.sendMessageToClient(firebaseToken, {
                senderDid: senderDid,
                type: dataType,
                message: messageToSent
            });
            next(new APIResult(202, { message: 'Accepted and forwarded to client' }), {
                status: 'Ok'
            });
        } catch (e) {
            next(new APIResult(503, { status: 503, error: e.message, type: 'Service Unavailable' }));
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
