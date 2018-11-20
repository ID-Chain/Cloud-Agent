const indy = require('indy-sdk');
const crypto = require('crypto');

module.exports = {
    /**
     * Generate and return a cryptographically secure random nonce
     * @return {string} nonce
     */
    async getNonce() {
        // node v8.x only supports Uint8Arrays as input to randomFill
        const arr = new Uint8Array(10);
        return new Promise((resolve, reject) => {
            crypto.randomFill(arr, (err, buf) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(buf.join(''));
                }
            });
        });
    },

    /**
     * Anoncrypt message for verkey
     * @param {string} verkey
     * @param {string} message either JSON.stringified or only a string
     * @return {Promise<string>} anoncrypted message string
     */
    async anonCrypt(verkey, message) {
        if (typeof message === 'object') {
            message = JSON.stringify(message);
        }
        const messageRaw = Buffer.from(message, 'utf-8');
        const messageBuf = await indy.cryptoAnonCrypt(verkey, messageRaw);
        return messageBuf.toString('base64');
    },

    /**
     * Anoncrypt JSON.stringify(message) for verkey
     * @param {string} verkey
     * @param {object} message
     * @return {Promise<string>} anoncrypted message string
     */
    async anonCryptJSON(verkey, message) {
        return await module.exports.anonCrypt(verkey, JSON.stringify(message));
    },

    /**
     * Anon decrypt encrypted message
     * @param {number} handle
     * @param {string} verkey
     * @param {string} encryptedMessage
     * @return {Promise<string>} decrypted string message
     */
    async anonDecrypt(handle, verkey, encryptedMessage) {
        const encryptedBuffer = Buffer.from(encryptedMessage, 'base64');
        const decryptedBuffer = await indy.cryptoAnonDecrypt(handle, verkey, encryptedBuffer);
        return decryptedBuffer.toString('utf-8');
    },

    /**
     * Anon decrypt and JSON.parse encrypted message
     * @param {number} handle
     * @param {string} verkey
     * @param {string} encryptedMessage
     * @return {Promise<Object>} decrypted message
     */
    async anonDecryptJSON(handle, verkey, encryptedMessage) {
        return JSON.parse(await module.exports.anonDecrypt(handle, verkey, encryptedMessage));
    },

    /**
     * Auth crypt message string
     * @param {number} handle
     * @param {string} senderVk
     * @param {string} recipientVk
     * @param {string} message
     * @return {Promise<string>} auth crypted message string
     */
    async authCrypt(handle, senderVk, recipientVk, message) {
        if (typeof message === 'object') {
            message = JSON.stringify(message);
        }
        const messageRaw = Buffer.from(message, 'utf-8');
        const messageBuf = await indy.cryptoAuthCrypt(handle, senderVk, recipientVk, messageRaw);
        return messageBuf.toString('base64');
    },

    /**
     * JSON.stringify and Auth crypt message object
     * @param {number} handle
     * @param {string} senderVk
     * @param {string} recipientVk
     * @param {Object} message
     * @return {Promise<string>} auth crypted message string
     */
    async authCryptJSON(handle, senderVk, recipientVk, message) {
        return await module.exports.authCrypt(handle, senderVk, recipientVk, JSON.stringify(message));
    },

    /**
     * Auth decrypt message
     * @param {number} handle
     * @param {string} recipientVk
     * @param {string} encryptedMessage
     * @return {Promise<string>} auth decrypted message string
     */
    async authDecrypt(handle, recipientVk, encryptedMessage) {
        const encryptedBuffer = Buffer.from(encryptedMessage, 'base64');
        const [, decryptedBuffer] = await indy.cryptoAuthDecrypt(handle, recipientVk, encryptedBuffer);
        return decryptedBuffer.toString('utf-8');
    },

    /**
     * Auth decrypt message and JSON.parse
     * @param {number} handle
     * @param {string} recipientVk
     * @param {string} encryptedMessage
     * @return {Promise<Object>} auth decrypted message
     */
    async authDecryptJSON(handle, recipientVk, encryptedMessage) {
        return JSON.parse(await module.exports.authDecrypt(handle, recipientVk, encryptedMessage));
    }
};
