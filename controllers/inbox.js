const urlid = require('../util/urlid');
const wrap = require('../util/asyncwrap').wrap;
const APIResult = require('../util/api-result');
const firebaseServer = require('../firebase/server');
const db = require('../persistence/db');
const http_secured = (process.env.SSL)? 'http://' : 'https://';
const MESSAGES_PATH=`${http_secured}${process.env.DOMAIN_HOST}:${process.env.DOMAIN_PORT}/ca/api/messages/`;

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

        const senderDid = await db.get(id);
        const obj = await db.get(senderDid);
        const firebaseToken = obj.token;

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
                      MESSAGES_PATH+urlId);
            await firebaseServer.sendMessageToClient(firebaseToken, {
                endpoint_did: senderDid,
                type: dataType,
                message: messageToSent
            });
            next(new APIResult(200, { message: 'Successfully sent to client' }), {
                status: 'Ok'
            });
        } catch (e) {
            next(new APIResult(503, { status: 503, error: e.message, type: 'Service Unavailable' }));
        }
    })
};
