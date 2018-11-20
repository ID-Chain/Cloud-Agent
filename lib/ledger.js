/**
 * IDChain Agent REST API
 * Pool Ledger Representation
 */

const util = require('util');
const indy = require('indy-sdk');
const APIResult = require('../util/api-result');
const log = require('../util/log').log;

/**
 * Wrap submit function to retry it
 * (seems like indy sometimes needs this when fetching information)
 * @param {function} submitFn
 * @return {function} async function which wraps submitFn
 */
function retrySubmit(submitFn) {
    return async function(...params) {
        let result;
        for (let i = 0; i < 3; i++) {
            result = await submitFn(...params);
            if (['REJECT', 'REQNACK'].includes(result['op']) || result['result']['data'] != null) {
                break;
            }
            await new Promise((resolve, reject) => setTimeout(resolve, 500 * i));
        }
        return result;
    };
}

/**
 * Pool Representation
 */
class PoolLedger {
    /**
     * @param {String} name pool name
     * @param {Object} config config object
     */
    constructor(name, config) {
        this.name = name;
        this.config = config;
        this.handle = -1;
    }

    /**
     * Create Pool Ledger Config
     */
    async createConfig() {
        await indy.setProtocolVersion(2);
        log.info('Creating pool ledger config %s with %s', this.name, util.inspect(this.config));
        await indy.createPoolLedgerConfig(this.name, this.config);
    }

    /**
     * Open Ledger connection
     */
    async openLedger() {
        log.info('providing pool handle for pool_name %s', process.env.POOL_NAME);
        this.handle = await indy.openPoolLedger(process.env.POOL_NAME);
        log.info('connection to pool ledger established');
    }

    /**
     * Retrieves schemas, credDefs, revStates, revRegDefs, and revRegs from ledger.
     * @param {String} submitterDid did to use for submitting requests to ledger
     * @param {Object[]} identifiers Array of objects containing schemaId, credDefId, and revRegId
     * @return {Any[]} [schemas, credDefs, revStates]
     */
    async proverGetEntitiesFromLedger(submitterDid, identifiers) {
        // TODO revocFn
        return this._getEntitiesFromLedger(submitterDid, identifiers, null);
    }

    /**
     * Retrieves schemas, credDefs, revStates, revRegDefs, and revRegs from ledger.
     * @param {String} submitterDid did to use for submitting requests to ledger
     * @param {Object[]} identifiers Array of objects containing schemaId, credDefId, and revRegId
     * @return {Any[]} [schemas, credDefs, revRegDefs, revRegs]
     */
    async verifierGetEntitiesFromLedger(submitterDid, identifiers) {
        // TODO revocFn
        return this._getEntitiesFromLedger(submitterDid, identifiers, null);
    }

    /**
     * Retrieve NYM record from the ledger
     * @param {string} submitterDid
     * @param {string} targetDid
     * @return {Object} NymResponse
     */
    async getNym(submitterDid, targetDid) {
        return await this._request(indy.buildGetNymRequest, indy.submitRequest, [submitterDid, targetDid], []);
    }

    /**
     * Create, sign, and submit nym request to ledger.
     * @param {any} walletHandle
     * @param {any} submitterDid
     * @param {any} targetDid
     * @param {any} verkey
     * @param {any} alias
     * @param {any} role
     * @return {Object} IndyResponse
     * @throws APIResult on error
     */
    async nymRequest(walletHandle, submitterDid, targetDid, verkey, alias, role) {
        return await this._request(
            indy.buildNymRequest,
            indy.signAndSubmitRequest,
            [submitterDid, targetDid, verkey, alias, role && role !== 'NONE' ? role : null],
            [walletHandle, submitterDid]
        );
    }

    /**
     * Create, sign, and submit attrib request to ledger.
     * @param {Number} walletHandle
     * @param {String} submitterDid
     * @param {String} targetDid
     * @param {String} hash (Optional) Hash of attribute data
     * @param {Json} raw (Optional) Json, where key is attribute name and value is attribute value
     * @param {String} enc (Optional) Encrypted attribute data
     * @return {Object} IndyResponse
     * @throws APIResult on error
     */
    async attribRequest(walletHandle, submitterDid, targetDid, hash, raw, enc) {
        return await this._request(
            indy.buildAttribRequest,
            indy.signAndSubmitRequest,
            [submitterDid, targetDid, hash, raw, enc],
            [walletHandle, submitterDid]
        );
    }

    /**
     * Submit a schema to the ledger.
     * @param {Number} walletHandle
     * @param {String} submitterDid
     * @param {Object} data the schema
     * @return {Promise} a promise which resolves when the request is completed
     */
    schemaRequest(walletHandle, submitterDid, data) {
        return this._request(
            indy.buildSchemaRequest,
            indy.signAndSubmitRequest,
            [submitterDid, data],
            [walletHandle, submitterDid]
        );
    }

    /**
     * Submit a credential definition to the ledger.
     * @param {Number} walletHandle
     * @param {String} submitterDid
     * @param {Object} data the credential definition
     * @return {Promise} a promise which resolves when the request is completed
     */
    credDefRequest(walletHandle, submitterDid, data) {
        return this._request(
            indy.buildCredDefRequest,
            indy.signAndSubmitRequest,
            [submitterDid, data],
            [walletHandle, submitterDid]
        );
    }

    /**
     * Submit a revocation registry definition to the ledger.
     * @param {Number} walletHandle
     * @param {String} submitterDid
     * @param {Object} data the revocRegDef
     * @return {Promise} a promise which resolves to the response
     */
    revocRegDefRequest(walletHandle, submitterDid, data) {
        return this._request(
            indy.buildRevocRegDefRequest,
            indy.signAndSubmitRequest,
            [submitterDid, data],
            [walletHandle, submitterDid]
        );
    }

    /**
     * Submit a revocation registry entry to the ledger.
     * @param {Number} walletHandle
     * @param {String} submitterDid
     * @param {String} revocRegDefId ID of the corresponding RevocRegDef
     * @param {String} revDefType revocation registry type
     * @param {Object} value registry specific data
     * @return {Promise} a promise which resolves to the response
     */
    revocRegEntryRequest(walletHandle, submitterDid, revocRegDefId, revDefType, value) {
        return this._request(
            indy.buildRevocRegEntryRequest,
            indy.signAndSubmitRequest,
            [submitterDid, revocRegDefId, revDefType, value],
            [walletHandle, submitterDid]
        );
    }

    /**
     * Retrieve Schema from ledger
     * @param {String} submitterDid
     * @param {String} schemaId
     * @return {any[]} [schemaId, schema]
     * @throws APIResult on error
     */
    async getSchema(submitterDid, schemaId) {
        return await this._get(
            indy.buildGetSchemaRequest,
            indy.submitRequest,
            indy.parseGetSchemaResponse,
            [submitterDid, schemaId],
            []
        );
    }

    /**
     * Retrieve Credential Definition from ledger
     * @param {String} submitterDid
     * @param {String} credDefId
     * @return {Any[]} [credDefId, credDef]
     * @throws APIResult on error
     */
    async getCredDef(submitterDid, credDefId) {
        return await this._get(
            indy.buildGetCredDefRequest,
            indy.submitRequest,
            indy.parseGetCredDefResponse,
            [submitterDid, credDefId],
            []
        );
    }

    /**
     * Retrieve Revocation Registry Definition from ledger
     * @param {String} submitterDid
     * @param {String} revocRegId
     * @return {Promise} resolves to [revocRegDefId, revocRegDef]
     * @throws APIResult on error
     */
    async getRevocRegDef(submitterDid, revocRegId) {
        return this._get(
            indy.buildGetRevocRegDefRequest,
            indy.submitRequest,
            indy.parseGetRevocRegDefResponse,
            [submitterDid, revocRegId],
            []
        );
    }

    /**
     * Get Ledger Transactions using from and to indexes
     * @param {Number} walletHandle
     * @param {String} submitterDid
     * @param {Number} from
     * @param {Number} to
     * @param {String} type, Ledger type: pool, domain, config
     * @return {Array} List of transactions
     * @throws APIResult on error
     */
    async getLedgerTransactions(walletHandle, submitterDid, from, to, type) {
        const response = [];
        for (let i = from; i < to; i++) {
            response.push(
                await this._request(
                    indy.buildGetTxnRequest,
                    indy.signAndSubmitRequest,
                    [submitterDid, type.toUpperCase(), i],
                    [walletHandle, submitterDid]
                )
            );
        }
        return response
            .filter(r => typeof r.result === 'object')
            .filter(r => r.result.data !== null)
            .map(r => r.result.data);
    }

    /**
     * Build and submit request to ledger and
     * return parsed response.
     * @param {Function} buildFn request build function
     * @param {Function} submitFn request submit function
     * @param {Function} parseFn response parse function
     * @param {Any[]} buildOpts build function arguments
     * @param {Any[]} submitOpts submit function arguments
     * @return {Object} parsed response
     * @throws APIResult on error
     */
    async _get(buildFn, submitFn, parseFn, buildOpts, submitOpts) {
        const result = await this._request(buildFn, retrySubmit(submitFn), buildOpts, submitOpts);
        return await parseFn(result);
    }

    /**
     * Retrieves schemas, credDefs, revStates, revRegDefs, and revRegs from ledger.
     * @param {String} submitterDid did to use for submitting requests to ledger
     * @param {Object[]} identifiers Array of objects containing schemaId, credDefId, and revRegId
     * @param {function} revocFn Function which creates revocStates or retrieves revocation definitions and registries
     * @return {Any[]} [schemas, credDefs, revStates, revRegDefs, revRegs]
     */
    async _getEntitiesFromLedger(submitterDid, identifiers, revocFn) {
        let schemas = {};
        let credDefs = {};
        let revRegDefsOrStates = {};
        let revRegs = {};
        for (const referent of Object.keys(identifiers)) {
            const item = identifiers[referent];
            const [schemaId, schema] = await this.getSchema(submitterDid, item['schema_id']);
            schemas[schemaId] = schema;
            const [credDefId, credDef] = await this.getCredDef(submitterDid, item['cred_def_id']);
            credDefs[credDefId] = credDef;

            if (item.rev_reg_seq_no) {
                // TODO for prover: create revocation states
                // TODO for verifier: get revocation definitions and registries
            }
        }

        return [schemas, credDefs, revRegDefsOrStates, revRegs];
    }

    /**
     * Build and submit request to ledger.
     * @param {Function} buildFn request build function
     * @param {Function} submitFn request submit function
     * @param {Any[]} buildOpts build function arguments
     * @param {Any[]} submitOpts submit function arguments
     * @return {Object} response
     * @throws APIResult on error
     */
    async _request(buildFn, submitFn, buildOpts, submitOpts) {
        log.debug(
            'pool_request; buildFn %s, requestFn %s, buildOpts %j, submitOpts %j',
            buildFn.name,
            submitFn.name,
            buildOpts,
            submitOpts
        );
        const request = await buildFn(...buildOpts);
        const result = await submitFn(this.handle, ...submitOpts, request);
        if (['REJECT', 'REQNACK'].includes(result['op'])) {
            throw new APIResult(400, result['reason']);
        }
        return result;
    }
}

module.exports = PoolLedger;
