const sdk = require('indy-sdk');

module.exports = {
    /**
     * Ensure Did Info, i.e. fetch from ledger if not present
     * @param {number} walletHandle
     * @param {PoolLedger} ledger
     * @param {String} did
     * @param {String} [verkey]
     * @param {String} [endpoint]
     * @return {Promise<String[]>} did, verkey, endpoint
     */
    async ensureDidInfo(walletHandle, ledger, did, verkey, endpoint) {
        if (!did) {
            const err = {
                error: {
                    status: 400,
                    message: 'did must be present'
                }
            };
            throw err;
        }

        // try to retrieve the verkey from the ledger
        try {
            const vk = await sdk.keyForDid(ledger.handle, walletHandle, did);
            // the key is on the ledger, check if there is a mismatch between
            // provided key and key on the ledger
            if (verkey && vk !== verkey) {
                const err = {
                    error: {
                        status: 400,
                        message: 'verkey mismatch'
                    }
                };
                throw err;
            } else {
                // if no key was provided or there is no mismatch
                // use the key from the ledger
                verkey = vk;
            }
        } catch (err) {
            // if none was provided and it is NOT on the ledger or
            // could not be retrieved, throw
            if (!verkey) {
                throw err;
            }
        }

        // if no endpoint is provided
        if (!endpoint) {
            // it must be on the ledger!
            [endpoint] = await sdk.getEndpointForDid(walletHandle, ledger.handle, did);
        }

        return [did, verkey, endpoint];
    },

    /**
     * Set did metadata to object
     * @param {number} walletHandle
     * @param {string} did
     * @param {object} meta
     * @return {Promise<void>}
     */
    async setDidMetaJSON(walletHandle, did, meta) {
        return sdk.setDidMetadata(walletHandle, did, JSON.stringify(meta));
    },

    /**
     * Get did metadata as object
     * @param {number} walletHandle
     * @param {string} did
     * @return {Promise<object>}
     */
    async getDidMetaJSON(walletHandle, did) {
        return JSON.parse(await sdk.getDidMetadata(walletHandle, did));
    },

    /**
     * Get did metadata attribute
     * @param {number} walletHandle
     * @param {string} did
     * @param {string} attributeName
     * @return {Promise<Any>}
     */
    async getDidMetaAttribute(walletHandle, did, attributeName) {
        const meta = await module.exports.getDidMetaJSON(walletHandle, did);
        return meta[attributeName];
    },

    /**
     * Set did metadata attribute
     * @param {number} walletHandle
     * @param {string} did
     * @param {string} attributeName
     * @param {Any} attributeValue
     * @return {Promise<void>}
     */
    async setDidMetaAttribute(walletHandle, did, attributeName, attributeValue) {
        const meta = (await module.exports.getDidMetaJSON(walletHandle, did)) || {};
        meta[attributeName] = attributeValue;
        return module.exports.setDidMetaJSON(walletHandle, did, meta);
    }
};
