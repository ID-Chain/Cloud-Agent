const indy = require('indy-sdk');
const message = require('./indy-message');
const nonce = require('../util/nonce').uuidv4hex;

module.exports = {
    /**
     * Create a connection offer and return it
     * @param {Wallet} wallet
     * @param {String} endpoint
     * @return {Object} connection offer - not encrypted
     */
    async createConnectionOffer(wallet, endpoint) {
        const did = wallet.ownDid;
        const vk = await indy.keyForLocalDid(wallet.handle, did);
        const offerNonce = nonce();
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
     * @param {Wallet} wallet
     * @param {String} myEndpoint
     * @param {String} requestNonce (optional) offer nonce
     * @return {Object} connection request - not encrypted
     */
    async createConnectionRequest(wallet, myEndpoint, requestNonce) {
        const [myDid, myVk] = await indy.createAndStoreMyDid(wallet.handle, {});
        const endpointVk = await indy.keyForLocalDid(wallet.handle, wallet.ownDid);
        requestNonce = requestNonce || nonce();
        return {
            id: requestNonce,
            type: message.messageTypes.CONNECTIONREQUEST,
            message: {
                did: myDid,
                verkey: myVk,
                endpointDid: wallet.ownDid,
                endpointVk: endpointVk,
                endpoint: myEndpoint,
                nonce: requestNonce
            }
        };
    },

    /**
     * Create a connection response
     * @param {Wallet} wallet
     * @param {String} theirDid their pairwise did
     * @param {String} requestNonce
     * @return {Object} connection response (formatted object - not encrypted)
     */
    async createConnectionResponse(wallet, theirDid, requestNonce) {
        const [myDid, myVk] = await indy.createAndStoreMyDid(wallet.handle, {});
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

    async createConnectionAcknowledgement(myDid) {
        return {
            id: myDid,
            type: message.messageTypes.CONNECTIONACKNOWLEDGE,
            message: 'success'
        };
    }
};
