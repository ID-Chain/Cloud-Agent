const wrap = require('../util/asyncwrap').wrap;
const APIResult = require('../util/api-result');
const firebaseServer = require('../firebase/server');

const db = require('../persistence/db');

module.exports = {
    send: wrap(async (req, res, next) => {
        const registrationToken = req.body.token;
        const message = req.body.message;

        try {
            await db.put(req.body.did, registrationToken);
            const messageId = await firebaseServer.sendMessageToClient(registrationToken, message);
            log.debug('Sent Message to Client:');
            next(new APIResult(200, { messageId: messageId }), {
                status: 'Ok'
            });
        } catch (err) {
            next(new APIResult(400, { message: err.message }, err));
        }
    }),

    retrieve: wrap(async (req, res, next) => {
        const urlid = req.params.id;
        const dba = db;
        const encodedCryptedMessage = await db.get(urlid);
        req.finalCallback = () => dba.del(urlid);
        next(new APIResult(200, { message: encodedCryptedMessage }), {
            status: 'Ok'
        });
    })
};
