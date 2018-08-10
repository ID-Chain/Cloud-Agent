var admin = require('firebase-admin');
const serviceAccount = require("../../eit-idchain-app-firebase-adminsdk-1pi13-80da98402a.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://eit-idchain-app.firebaseio.com"
});

module.exports = admin;