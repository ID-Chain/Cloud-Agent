const indy = require('indy-sdk');

module.exports = {
    /**
     * @param {number} walletHandle
     * @param {string} theirDid
     * @return {Promise<object>} pairwise object with parsed metadata
     */
    async getPairwise(walletHandle, theirDid) {
        const pairwise = await indy.getPairwise(walletHandle, theirDid);
        pairwise.metadata = pairwise.metadata ? JSON.parse(pairwise.metadata) : {};
        return pairwise;
    },

    /**
     * JSON.stringify data and set as pairwise metadata
     * @param {number} walletHandle
     * @param {string} theirDid
     * @param {object} data
     * @return {Promise<void>} resolves when metadata is set, rejects on error
     */
    async setPairwiseMetadata(walletHandle, theirDid, data) {
        return indy.setPairwiseMetadata(walletHandle, theirDid, JSON.stringify(data));
    }
};
