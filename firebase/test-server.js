require('dotenv').config();
const admin = require('../persistence/fb-admin');

var token = process.argv[2];

// See documentation on defining a message payload.
var message = {
    data: {
        title: 'Portugal vs. Denmark',
        body: '5 to 1',
        icon: 'firebase-logo.png'
    },
    token: token
};

admin
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
