var admin = require('firebase-admin');
const serviceAccount = require(process.env.FIREBASE_ADMIN_PATH);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_PROJECT_URL
});

module.exports = admin;