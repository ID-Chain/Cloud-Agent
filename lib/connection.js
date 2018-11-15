const indy = require('indy-sdk');
const message = require('./indy-message');
const crypto = require('./crypto');

module.exports = {
    /**
     * Create a connection offer and return it
     * @param {string} did endpoint/own did
     * @param {string} vk endpoint/own verkey
     * @param {string} endpoint
     * @return {Promise<Object>} connection offer - not encrypted
     */
    async createConnectionOffer(did, vk, endpoint) {
        const offerNonce = await crypto.getNonce();
        return {
            id: offerNonce,
            type: message.messageTypes.CONNECTIONOFFER,
            message: {
                did: did,
                verkey: vk,
                endpoint: endpoint,
                nonce: offerNonce
            }
        };
    },

    /**
     * Create a connection request
     * @param {string} did endpoint/own did
     * @param {string} vk endpoint/own verkey
     * @param {String} myDid my pairwise did
     * @param {String} myVk my pairwise did verkey
     * @param {String} myEndpoint my endpoint
     * @param {String} [offerNonce] (optional) offer nonce
     * @return {Promise<Object>} connection request - not encrypted
     */
    async createConnectionRequest(did, vk, myDid, myVk, myEndpoint, offerNonce) {
        const requestNonce = await crypto.getNonce();
        return {
            id: offerNonce || requestNonce,
            type: message.messageTypes.CONNECTIONREQUEST,
            message: {
                did: myDid,
                verkey: myVk,
                endpointDid: did,
                endpointVk: vk,
                endpoint: myEndpoint,
                nonce: requestNonce
            }
        };
    },

    /**
     * Create a connection response
     * @param {String} myDid my pairwise did
     * @param {String} myVk my pairwise did verkey
     * @param {String} theirDid their pairwise did
     * @param {String} requestNonce
     * @return {Object} connection response (formatted object - not encrypted)
     */
    createConnectionResponse(myDid, myVk, theirDid, requestNonce) {
        return {
            id: requestNonce,
            aud: theirDid,
            type: message.messageTypes.CONNECTIONRESPONSE,
            message: {
                did: myDid,
                verkey: myVk,
                nonce: requestNonce
            }
        };
    },

    /**
     * Create a connection acknowledgement
     * @param {String} myDid
     * @return {Object} connection acknowledgement (formatted object - not encrypted)
     */
    createConnectionAcknowledgement(myDid) {
        return {
            id: myDid,
            type: message.messageTypes.CONNECTIONACKNOWLEDGE,
            message: 'success'
        };
    },

    /**
     * Store their did and create a pairwise
     * @param {number} walletHandle
     * @param {string} myDid my pairwise did
     * @param {string} theirDid their pairwise did
     * @param {string} theirVk their pairwise verkey
     * @param {object} meta pairwise meta
     */
    async createRelationship(walletHandle, myDid, theirDid, theirVk, meta) {
        await indy.storeTheirDid(walletHandle, {
            did: theirDid,
            verkey: theirVk
        });
        await indy.createPairwise(walletHandle, theirDid, myDid, JSON.stringify(meta));
    }
};
