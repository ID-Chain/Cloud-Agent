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

        const did = await db.get(req.wallet.config.id);
        //const messageBuf = await req.wallet.anonDecrypt(did,message);     
        const targetDid = await db.get(id);
        const senderDid = await db.get(targetDid);
        const firebaseToken = await db.get(senderDid);

        //const encryptedMessage = req.wallet.anonCrypt(senderDid, messageBuf);
        const encodedDecryptedMessage = Buffer.from(JSON.stringify(message)).toString('base64');
        //const encodedCryptedMessage = Buffer.from(JSON.stringify(encryptedMessage)).toString('base64');
        const n = encodedDecryptedMessage.length;
        const byteSize = 4 * Math.ceil(n / 3);
        

        console.log('byte size of decrypted message:', byteSize);
        
        try {
            let messageToSent = (byteSize < 4000)? messageToSent = encodedDecryptedMessage: (
                urlId = shortid.generate(),
                db.put(urlId, encodedCryptedMessage),
                messageToSent = `http://${process.env.APP_HOST}:${process.env.APP_PORT}/agency/api/messages/${urlId}`
            )
            await firebaseServer.sendMessageToClient(firebaseToken, { message: encodedDecryptedMessage });
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
