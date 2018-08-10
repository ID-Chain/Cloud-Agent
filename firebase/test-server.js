const admin = require('../persistence/fb-admin');

var firebaseToken = 'eSve9rGdJD8:APA91bHYCSmpSFqBGRRpZrr2kM7ElVEYYw-YlKfy_vCptqaJ1AO2Znko_dqQI8n2J4sFoNs5aO0RoaOP4IhNkg-g0Jk6dg8ak__BDv3T5-_G0LB4D2RjRUJp9OXZTGT-0CvMnV6T9WtbShmPrSlHySHTDMebAN8clA';
// See documentation on defining a message payload.
var message = {
    webpush: {
        notification:{
            title: "Portugal vs. Denmark",
            body:  "5 to 1",
            icon: "firebase-logo.png",
        }
    },
    token: firebaseToken
};

admin.messaging().send(message)
    .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
        return response
    })
    .catch((error) => {
        console.log('Error sending message:', error);
        return error
    });
