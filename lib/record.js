const indy = require('indy-sdk');

const types = {
    connection: 'connection'
};

module.exports = {
    types,

    /**
     * Add a record to the wallet
     * @param {number} walletHandle
     * @param {string} type
     * @param {string} id
     * @param {object} data
     * @param {object} [tags]
     * @return {Promise<void>} resolves when stored or error
     */
    async addWalletRecord(walletHandle, type, id, data, tags) {
        return indy.addWalletRecord(walletHandle, type, id, JSON.stringify(data), tags);
    },

    /**
     * Retrieve a record from the wallet and JSON.parse()
     * @param {number} walletHandle
     * @param {string} type
     * @param {string} id
     * @param {object} [options]
     * @return {Promise<object>} wallet record
     */
    async getWalletRecordJSON(walletHandle, type, id, options = {}) {
        let record = await indy.getWalletRecord(walletHandle, type, id, options);
        if (record) {
            record = JSON.parse(record.value);
        }
        return record;
    },

    /**
     * Update a record in the wallet
     * @param {number} walletHandle
     * @param {string} type
     * @param {string} id
     * @param {object} data
     * @return {Promise<void>} resolves when stored or error
     */
    async updateWalletRecordValue(walletHandle, type, id, data) {
        return indy.updateWalletRecordValue(walletHandle, type, id, JSON.stringify(data));
    },

    /**
     * Delete a record from the wallet
     * @param {number} walletHandle
     * @param {string} type
     * @param {string} id
     * @return {Promise<void>} resolves when deleted or error
     */
    async deleteWalletRecord(walletHandle, type, id) {
        return indy.deleteWalletRecord(walletHandle, type, id);
    }
};
