const wrap = require('../util/asyncwrap').wrap;
const log = require('../util/log').log;
const APIResult = require('../util/api-result');
const firebaseServer = require('../firebase/server');

const db = require('../persistence/db');

module.exports = {
    send: wrap(async (req, res, next) => {
        try {
            await firebaseServer.sendMessageToClient(req.body.firebase_token, { message: req.body.message });
            log.debug('Sent Message to Client:');
            next(new APIResult(202, { message: 'Accepted and forwarded to client' }), {
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
