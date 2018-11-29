const uuid = require('uuid/v4');

const wrap = require('../util/asyncwrap').wrap;
const log = require('../util/log').log;
const APIResult = require('../util/api-result');
const firebaseServer = require('../firebase/server');
const db = require('../persistence/db');
const lib = require('../lib');

const http_secured = process.env.SSL === 'true' ? 'https://' : 'http://';
const MESSAGES_PATH = `${http_secured}${process.env.DOMAIN_HOST}:${process.env.DOMAIN_PORT}/ca/api/messages/`;

module.exports = {
    forward: wrap(async (req, res, next) => {
        const id = req.params.id;
        const message = req.body.message;
        let encodedMessage;

        const senderDid = await db.get(id);
        try {
            // If message was anoncrypted for cloud agent
            log.debug(senderDid);
            const { did, verkey } = await db.get(req.wallet.config.id);
            const recipientVk = await lib.sdk.keyForLocalDid(req.wallet.handle, senderDid);
            const decryptedMessage = await lib.crypto.anonDecrypt(req.wallet.handle, verkey, message);
            encodedMessage = await lib.crypto.anonCrypt(recipientVk, decryptedMessage);
        } catch (err) {
            // Forward only, if anondecrypt did not work
            log.error(err);
            encodedMessage = message;
        }

        const obj = await db.get(senderDid);
        const firebaseToken = obj.token;

        const n = encodedMessage.length;
        const byteSize = 4 * Math.ceil(n / 3);
        let dataType;

        log.debug('byte size of decrypted message:', byteSize);

        try {
            let messageToSent =
                byteSize < 4000
                    ? ((dataType = 'data'), encodedMessage)
                    : ((dataType = 'url'), (urlId = uuid()), await db.put(urlId, encodedMessage), MESSAGES_PATH + urlId);
            await firebaseServer.sendMessageToClient(firebaseToken, {
                did: senderDid,
                type: dataType,
                message: messageToSent
            });
            next(new APIResult(202, { message: 'Accepted and forwarded to client' }));
        } catch (e) {
            next(new APIResult(503, { message: 'Service Unavailable' }, e));
        }
    })
};
