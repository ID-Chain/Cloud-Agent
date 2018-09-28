const uuid = require('uuid/v4');
const wrap = require('../util/asyncwrap').wrap;
const log = require('../util/log').log;
const APIResult = require('../util/api-result');
const firebaseServer = require('../firebase/server');
const db = require('../persistence/db');
const lib = require('../lib');
const pool = require('../lib/pool');
const http_secured = process.env.SSL ? 'http://' : 'https://';
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
            const did = await db.get(req.wallet.config.id);
            const messageBuf = await lib.crypto.anonDecryptToBuffer(req.wallet.handle, did, message);
            const encryptedMessage = await lib.crypto.anonCryptFromBuffer(senderDid, messageBuf);
            encodedMessage = Buffer.from(JSON.stringify(encryptedMessage)).toString('base64');
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
                    : ((dataType = 'url'), (urlId = uuid()), db.put(urlId, encodedMessage), MESSAGES_PATH + urlId);
            await firebaseServer.sendMessageToClient(firebaseToken, {
                did: senderDid,
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

    receive: wrap(async (req, res, next) => {
        const handle = req.wallet.handle;
        const caEndpoint = await db.get(req.wallet.config.id);
        const myDid = caEndpoint.did;
        const myVerKey = caEndpoint.verkey;

        const message = await lib.crypto.anonDecrypt(myDid, req.body.message);
        if (message.type == lib.message.messageTypes.CONNECTIONRESPONSE) {
            const request = db.get(message.id);
            if (request) {
               messagePayload = await lib.crypto.anonDecrypt(myDid, message.message);
               await indy.storeTheirDid(handle, {did: messagePayload.did, verkey:messagePayload.verkey});

               const connectionAck = await lib.connection.createConnectionAcknowledgement(myDid);
               const authCryptedMessage = await lib.crypto.authCrypt(handle,myVerKey, messagePayload.verkey, connectionAck.message);    
               const encryptedMessage = await crypto.anonCrypt(vk, Object.assign({}, connectionAck, {message: authCryptedMessage}));
               await lib.message.sendMessage(encryptedMessage, TRUST_ANCHOR_ENDPOINT);
            } else {
                return next(new APIResult(401, { message: 'Cannot find this connection request' }));
            }
        } else {
            return next(new APIResult(401, { message: 'Cannot handle this message type' }));
        }
        return next(apiResult);
    }),

    async receiveResponse(wallet, message) {
        log.debug('received response');
        const connReq = await Message.findOne({
            messageId: message.id,
            type: lib.message.messageTypes.CONNECTIONOFFER,
            wallet: wallet.id,
            senderDid: wallet.ownDid
        }).exec();
        if (!connReq) {
            return APIResult.badRequest('no corresponding connection request found');
        }
        return await module.exports.acceptResponse(wallet, connReq, message);
    }
};
