/**
 * Indy Messages
 */

const agent = require('superagent');
const indy = require('indy-sdk');
const crypto = require('./crypto');

module.exports = {
    messageTypes: {
        CONNECTIONOFFER: 'urn:sovrin:agent:message_type:sovrin.org/connection_offer',
        CONNECTIONREQUEST: 'urn:sovrin:agent:message_type:sovrin.org/connection_request',
        CONNECTIONRESPONSE: 'urn:sovrin:agent:message_type:sovrin.org/connection_response',
        CONNECTIONACKNOWLEDGE: 'urn:sovrin:agent:message_type:sovrin.org/connection_acknowledge',
        CREDENTIALOFFER: 'urn:sovrin:agent:message_type:sovrin.org/credential_offer',
        CREDENTIALREQUEST: 'urn:sovrin:agent:message_type:sovrin.org/credential_request',
        CREDENTIAL: 'urn:sovrin:agent:message_type:sovrin.org/credential',
        PROOFREQUEST: 'urn:sovrin:agent:message_type:sovrin.org/proof_request',
        PROOF: 'urn:sovrin:agent:message_type:sovrin.org/proof'
    },

    sendMessage(message, endpoint) {
        return agent
            .post(endpoint)
            .type('application/json')
            .send({
                message: message
            });
    },

    async sendAnoncryptMessage(poolHandle, walletHandle, did, message) {
        const didvk = await indy.keyForDid(poolHandle, walletHandle, did);
        const [endpoint, transportVk] = await indy.getEndpointForDid(walletHandle, poolHandle, did);
        const vk = transportVk || didvk;
        const encryptedMessage = await crypto.anonCrypt(vk, message);
        return module.exports.sendMessage(encryptedMessage, endpoint);
    },

    async sendAnoncryptMessageToEndpoint(vk, endpoint, message){
        const encryptedMessage = await crypto.anonCrypt(vk, message);
        return module.exports.sendMessage(encryptedMessage, endpoint);
    },

};
