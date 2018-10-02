const indy = require('indy-sdk');

module.exports = {

    async anonDecryptToBuffer(handle, recipientDid, messageString) {
        const cryptMessageBuf = Buffer.from(messageString, 'base64');
        const recipientVk = await indy.keyForLocalDid(handle, recipientDid);
        return await indy.cryptoAnonDecrypt(handle, recipientVk, cryptMessageBuf);
    },

    async anonCryptFromBuffer(handle, did, messageBuf) {
        const verKey = await indy.keyForLocalDid(handle, did);
        return await indy.cryptoAnonCrypt(verKey, messageBuf);
    },

    async anonCrypt(verkey, message) {
        if (typeof message === 'object') {
            message = JSON.stringify(message);
        }
        const messageRaw = Buffer.from(message, 'utf-8');
        const messageBuf = await indy.cryptoAnonCrypt(verkey, messageRaw);
        return messageBuf.toString('base64');
    },

    async anonDecrypt(handle, did, encryptedMessage) {
        const encryptedBuffer = Buffer.from(encryptedMessage, 'base64');
        const verkey = await indy.keyForLocalDid(handle, did);
        const decryptedBuffer = await indy.cryptoAnonDecrypt(handle, verkey, encryptedBuffer);
        const decryptedString = Buffer.from(decryptedBuffer).toString('utf-8');
        const decryptedMessage = JSON.parse(decryptedString);
        return decryptedMessage;
    },

    async authCrypt(handle, senderVk, recipientVk, message) {
        if (typeof message === 'object') {
            message = JSON.stringify(message);
        }
        const messageRaw = Buffer.from(message, 'utf-8');
        const messageBuf = await indy.cryptoAuthCrypt(handle, senderVk, recipientVk, messageRaw);
        return messageBuf.toString('base64');
    },

    async authDecrypt(handle, recipientVk, encryptedMessage) {
        const encryptedBuffer = Buffer.from(encryptedMessage, 'base64');
        const [senderVk, decryptedBuffer] = await indy.cryptoAuthDecrypt(handle, recipientVk, encryptedBuffer);
        const messageJson = JSON.parse(decryptedBuffer.toString('utf-8'));
        return [messageJson, senderVk];
    }
};
