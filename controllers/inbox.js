const shortid = require('shortid');
const level = require('level');

const wrap = require('../util/asyncwrap').wrap;
const APIResult = require('../util/api-result');
const firebaseServer = require('../firebase/server');
const db = require('../persistence/db');

module.exports = {
    forward: wrap(async (req, res, next) => {
        const id = req.params.id;
        const message = req.body.message;
        // ToDo: bin indy-sdk
        //const recipientVk = req.wallet.ownDid;
        //const decryptedMessage = await indy.cryptoAnonDecrypt(wh,recipientVk, message)
        const decryptedMessage = {
            id: 'some_did_or_nonce',
            type: 'some_indy_message_type',
            message: 'some_encrypted_or_plain_message_trying_bigger'
        };
        const targetDid = await db.get(id);
        const senderDid = await db.get(targetDid);
        const firebaseToken = await db.get(senderDid);

        // anoncrypt with senderDid
        // keyForDid
        const encodedDecryptedMessage = Buffer.from(JSON.stringify(decryptedMessage)).toString('base64');
        const n = encodedDecryptedMessage.length;
        const byteSize = 4 * Math.ceil(n / 3);
        if (byteSize < 4000) {
        }

        console.log('byte size of decrypted message:', byteSize);
        try {
            await firebaseServer.sendMessageToClient(firebaseToken, { encodedMessage: encodedDecryptedMessage });
            next(new APIResult(200, { message: 'Successfully sent to client' }), {
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
