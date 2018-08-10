const admin = require('../persistence/fb-admin');
const wrap = require('../util/asyncwrap').wrap;

// Send a message to the device corresponding to the provided
// registration token.
async function sendMessage(message) {
    await admin
        .messaging()
        .send(message)
        .then(response => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
            return response;
        })
        .catch(error => {
            console.log('Error sending message:', error);
            return error;
        });
}
module.exports = {
    /**
     * @argument firebaseToken: firebase registration token
     * @argument appMessage: data object containing a json of key-values. Nested objects are not supported unless stringified.
     */
    sendMessageToClient: wrap(async (firebaseToken, appMessage) => {
        let fcmMessage = {};
        fcmMessage.data = appMessage;
        fcmMessage.token = firebaseToken;
        console.log(fcmMessage);
        const response = await sendMessage(fcmMessage);
        return response;
    })
};
