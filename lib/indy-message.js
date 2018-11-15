/**
 * Indy Messages
 */
'use strict';

const indy = require('indy-sdk');
const agent = require('superagent');
const crypto = require('./crypto');
const pairwise = require('./pairwise');

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

    /**
     * Send message to endpoint
     * @param {string} endpoint
     * @param {string} message
     * @return {SuperAgentRequest}
     */
    sendMessage(endpoint, message) {
        return agent
            .post(endpoint)
            .type('application/json')
            .send({
                message: message
            });
    },

    /**
     * Anoncrypt and send message
     * @param {string} recipientVk
     * @param {string} endpoint
     * @param {(string | Object)} message
     * @return {SuperAgentRequest}
     */
    async sendAnoncryptMessage(recipientVk, endpoint, message) {
        const cryptFn = typeof message === 'object' ? crypto.anonCryptJSON : crypto.anonCrypt;
        return module.exports.sendMessage(endpoint, await cryptFn(recipientVk, message));
    },

    /**
     * Authcrypt inner message, anoncrypt whole payload and send message
     * @param {number} walletHandle
     * @param {string} recipientDid
     * @param {object} message
     * @return {Promise<SuperAgentRequest>}
     */
    async sendAuthcryptMessage(walletHandle, recipientDid, message) {
        const pairwiseInfo = await pairwise.getPairwise(walletHandle, recipientDid);
        const senderVk = await indy.keyForLocalDid(walletHandle, pairwiseInfo['my_did']);
        const recipientVk = await indy.keyForLocalDid(walletHandle, recipientDid);
        const innerMessage = await crypto.authCryptJSON(walletHandle, senderVk, recipientVk, message.message);
        return module.exports.sendAnoncryptMessage(
            pairwiseInfo.metadata.theirEndpointVk,
            pairwiseInfo.metadata.theirEndpoint,
            Object.assign({}, message, { message: innerMessage })
        );
    },

    /**
     * Decrypt authcrypted message from senderDid
     * @param {number} walletHandle
     * @param {string} senderDid
     * @param {string} message authcrypted message
     * @return {Promise<object>} decrypted and parsed message object
     */
    async authdecryptMessage(walletHandle, senderDid, message) {
        const pairwiseInfo = await pairwise.getPairwise(walletHandle, senderDid);
        const recipientVk = await indy.keyForLocalDid(walletHandle, pairwiseInfo['my_did']);
        return crypto.authDecryptJSON(walletHandle, recipientVk, message);
    }
};
