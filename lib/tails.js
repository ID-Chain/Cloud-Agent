const indy = require('indy-sdk');

module.exports = {
    /**
     * Open a blob storage writer
     * @param {Object} blobStorageConfig
     * @param {String} blobStorageType optional, uses 'default' if none provided
     * @return {Promise} resolves to a handle (number)
     */
    openBlobStorageWriter(blobStorageConfig, blobStorageType = 'default') {
        return indy.openBlobStorageWriter(blobStorageType, blobStorageConfig);
    },

    /**
     * Open a blob storage reader
     * @param {Object} blobStorageConfig
     * @param {String} blobStorageType optional, uses 'default' if none provided
     * @return {Promise} resolves to a handle (number)
     */
    openBlobStorageReader(blobStorageConfig, blobStorageType = 'default') {
        return indy.openBlobStorageReader(blobStorageType, blobStorageConfig);
    }
};
