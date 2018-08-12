const wrap = require('../util/asyncwrap').wrap;
const APIResult = require('../util/api-result');
const firebaseServer = require('../firebase/server');

const db = require('../persistence/db');

module.exports = {
    send: wrap(async (req, res, next) => {
        const registrationToken = req.body.id;
        const type = req.body.type;
        const message = req.body.message;
        // console.log(registrationToken)
        // console.log(message);
        await db.put(req.body.did, registrationToken);
        const messageId = await firebaseServer.sendMessageToClient(registrationToken, message);
        console.log('Sent Message to Client: %s', messageId);
        // ToDo

        next(new APIResult(200, { messageId: messageId }), {
            status: 'Ok'
        });
    }),

    retrieve: wrap(async (req, res, next) => {
        console.log('GET request received');
        
        const encodedCryptedMessage = await db.get(req.params.id);

        next(new APIResult(200, { message: encodedCryptedMessage }), {
            status: 'Ok'
        });
    })
};
