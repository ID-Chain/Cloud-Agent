/**
 * IDChain Agent REST API
 * Errors
 */

/**
 * Corresponds to HTTP 404 Not Found Errors
 */
class NotFound extends Error {
    /**
     * @param {String} message error message
     */
    constructor(message) {
        super(message);
        this.status = 404;
    }
}

module.exports = {
    NotFound
};
