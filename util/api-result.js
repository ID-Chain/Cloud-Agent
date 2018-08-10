/**
 * Class encapsulating a result from the API
 * May be used for both successful responses
 * and error message propagation
 */
class APIResult {
    /**
     * @param {Number} status HTTP status code
     * @param {Object} data response data
     * @param {Object} error an error
     */
    constructor(status, data, error) {
        this.status = status;
        this.data = data;
        this.error = error;
    }
}

module.exports = APIResult;
