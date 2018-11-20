const sdk = require('indy-sdk');

const message = require('./indy-message');

module.exports = {
    /**
     * Encode a value as required by indy, i.e.
     * toString numbers and process strings.
     * @param {any} value value to encode
     * @return {string} encoded value
     */
    encode(value) {
        const valueType = typeof value;
        if (valueType === 'number' || !isNaN(Number(value))) {
            return value.toString();
        }
        if (valueType === 'string') {
            let result = '';
            for (let i = 0; i < value.length; i++) {
                result += value.charCodeAt(i).toString(16);
            }
            return result;
        }
        if (valueType === 'boolean') {
            return value ? '1' : '0';
        }

        const err = {
            error: {
                name: 'LibError',
                status: 500,
                message: 'encode failure, unsupported value type ' + valueType
            }
        };
        throw err;
    },

    /**
     * Create a credential offer and return it
     * @param {number} walletHandle
     * @param {string} credDefId
     * @param {string} recipientDid
     * @return {Promise<Object>} credential offer - not encrypted
     */
    async createCredentialOffer(walletHandle, credDefId, recipientDid) {
        const pairwise = await sdk.getPairwise(walletHandle, recipientDid);
        const innerMessage = await sdk.issuerCreateCredentialOffer(walletHandle, credDefId);
        return {
            id: innerMessage.nonce,
            origin: pairwise['my_did'],
            type: message.messageTypes.CREDENTIALOFFER,
            message: innerMessage
        };
    },

    async createCredentialRequest(walletHandle, senderDid, credentialOffer, credentialDefinition, masterSecretId) {
        const [innerMessage, meta] = await sdk.proverCreateCredentialReq(
            walletHandle,
            senderDid,
            credentialOffer,
            credentialDefinition,
            masterSecretId
        );
        const request = {
            id: credentialOffer.nonce,
            origin: senderDid,
            type: message.messageTypes.CREDENTIALREQUEST,
            message: innerMessage
        };
        return [request, meta];
    }
};
