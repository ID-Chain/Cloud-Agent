/**
 * IDChain Agent REST API
 * Nonce Generation
 */

const uuidv4 = require('uuid/v4');

module.exports = {
    /**
     * Generates a uuid v4 and converts it to hexadecimal representation
     * @return {String} uuidv4 in hex format
     */
    uuidv4hex() {
        // FIXME nonce is some long number instead of a short-ish string
        return Buffer.from(uuidv4(), 'utf-8').toString('hex');
    }
};
