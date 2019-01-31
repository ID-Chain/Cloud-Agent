'use strict';

/**
 * Class encapsulating a result from the API
 * May be used for both successful responses
 * and error message propagation
 */
class APIResult {
    /**
     * @param {number} status HTTP status code
     * @param {Object} data response data
     * @param {Object} error an error
     */
    constructor(status, data={}, error="") {
        this.status = status;
        this.data = data;
        this.error = error;
    }

    /**
     * Create APIResult with status and message
     * @param {number} status HTTP StatusCode
     * @param {(string | Object)} message message String or Object
     * @return {APIResult} APIResult with status and message
     */
    static create(status, message) {
        if (message && typeof message == 'string') {
            return new APIResult(status, { message: message });
        }
        if (message && (typeof message == 'object' || Array.isArray(message))) {
            return new APIResult(status, message);
        }
        return new APIResult(status);
    }

    /**
     * @param {(string | Object)} [message] (optional) message String or Object
     * @return {APIResult} APIResult with status 200
     */
    static success(message) {
        if (message) {
            return APIResult.create(200, message);
        }
        return success;
    }

    /**
     * @param {(string | Object)} [message] (optional) message String or Object
     * @return {APIResult} APIResult with status 201
     */
    static created(message) {
        if (message) {
            return APIResult.create(201, message);
        }
        return created;
    }

    /**
     * @param {(string | Object)} [message] (optional) message String or Object
     * @return {APIResult} APIResult with status 202
     */
    static accepted(message) {
        if (message) {
            return APIResult.create(202, message);
        }
        return accepted;
    }

    /**
     * @return {APIResult} APIResult with status 204
     */
    static noContent() {
        return noContent;
    }

    /**
     * @param {(string | Object)} [message] (optional) message String or Object
     * @return {APIResult} APIResult with status 400
     */
    static badRequest(message) {
        if (message) {
            return APIResult.create(400, message);
        }
        return badRequest;
    }

    /**
     * @param {(string | Object)} [message] (optional) message String or Object
     * @return {APIResult} APIResult with status 403
     */
    static forbidden(message) {
        if (message) {
            return APIResult.create(403, message);
        }
        return forbidden;
    }

    /**
     * @param {(string | Object)} [message] (optional) message String or Object
     * @return {APIResult} APIResult with status 404
     */
    static notFound(message) {
        if (message) {
            return APIResult.create(404, message);
        }
        return notFound;
    }
}

const success = new APIResult(200);
const created = new APIResult(201);
const accepted = new APIResult(202);
const noContent = new APIResult(204);
const badRequest = new APIResult(400);
const forbidden = new APIResult(403);
const notFound = new APIResult(404);

module.exports = APIResult;
