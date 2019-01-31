const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-adminsdk.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.IDC_CA_FIREBASE_PROJECT_URL
});

module.exports = admin;