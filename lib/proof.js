const sdk = require('indy-sdk');
const crypto = require('./crypto');
const pairwise = require('./pairwise');
const message = require('./indy-message');

/**
 * Retrieve and build requestedFields object for requested field object in proof request
 * to use in creation of proof
 * @param {number} walletHandle
 * @param {string} submitterDid
 * @param {Ledger} ledger
 * @param {number} searchHandle
 * @param {object} requestFields requested field object in proof request, e.g. requested_attributes, ...
 * @param {object} [values] values for self-attested-attributes
 * @return {Promise<Any[]>} [selfAttestededAttributes, requestedFields]
 */
async function buildRequestedFields(walletHandle, submitterDid, ledger, searchHandle, requestFields, values) {
    const schemas = {};
    const credentialDefinitions = {};
    const selfAttestedAttributes = {};
    const requestedFields = {};

    // loop through referents of requestFields (which is requested_attributes or requested_predicates) object
    for (const referent of Object.keys(requestFields)) {
        const attribute = requestFields[referent];
        const result = await sdk.proverFetchCredentialsForProofReq(searchHandle, referent, 1);

        if (result.length > 0) {
            // we found one, just use first one for now
            const credential = result[0]['cred_info'];
            requestedFields[referent] = {
                cred_id: credential.referent
            };
            // retrieve additional information (as needed for proof creation)
            schemas[credential.schema_id] = (await ledger.getSchema(submitterDid, credential.schema_id))[1];
            credentialDefinitions[credential.cred_def_id] = (await ledger.getCredDef(
                submitterDid,
                credential.cred_def_id
            ))[1];
        } else if ((!attribute.restrictions || attribute.restrictions.length === 0) && values[attribute.name]) {
            // there was none but we have a value and also no restrictions so add it to self-attested
            selfAttestedAttributes[referent] = values[attribute.name];
        } else {
            // no credential and no value and/or restrictions => throw error
            const err = {
                error: {
                    name: 'LibError',
                    status: 400,
                    message:
                        'failed to build proof request: invalid or missing value for requested field in proof request'
                }
            };
            throw err;
        }
    }

    return [selfAttestedAttributes, requestedFields, schemas, credentialDefinitions];
}

module.exports = {
    /**
     * Create a proof request message
     * @param {number} walletHandle
     * @param {string} recipientDid
     * @param {object} proofRequest proof request object containing requested_attributes, requested_predicates, .. but not nonce etc.
     * @return {Promise<object>} proof request message object
     */
    async createProofRequest(walletHandle, recipientDid, proofRequest) {
        const pairwiseInfo = await pairwise.getPairwise(walletHandle, recipientDid);
        proofRequest.nonce = await crypto.getNonce();
        return {
            id: proofRequest.nonce,
            type: message.messageTypes.PROOFREQUEST,
            origin: pairwiseInfo['my_did'],
            message: proofRequest
        };
    },

    /**
     * Create a proof message
     * @param {number} walletHandle
     * @param {Ledger} ledger
     * @param {string} masterSecretId
     * @param {string} recipientDid
     * @param {object} proofRequest
     * @param {object} [values]
     * @return {Promise<object>} proof message object
     */
    async createProof(walletHandle, ledger, masterSecretId, recipientDid, proofRequest, values = {}) {
        const pairwiseInfo = await pairwise.getPairwise(walletHandle, recipientDid);
        const searchHandle = await sdk.proverSearchCredentialsForProofReq(walletHandle, proofRequest, null);
        const [
            selfAttestedAttributes,
            requestedAttributes,
            attributeSchemas,
            attributeCredentialDefinitions
        ] = await buildRequestedFields(
            walletHandle,
            pairwiseInfo['my_did'],
            ledger,
            searchHandle,
            proofRequest.requested_attributes,
            values
        );
        const [
            selfAttestedPredicates,
            requestedPredicates,
            predicateSchemas,
            predicateCredentialDefinitions
        ] = await buildRequestedFields(
            walletHandle,
            pairwiseInfo['my_did'],
            ledger,
            searchHandle,
            proofRequest.requested_predicates,
            values
        );
        await sdk.proverCloseCredentialsSearchForProofReq(searchHandle);
        Object.keys(requestedAttributes).map(k => (requestedAttributes[k].revealed = true));
        const requestedCredentials = {
            self_attested_attributes: Object.assign({}, selfAttestedAttributes, selfAttestedPredicates),
            requested_attributes: requestedAttributes,
            requested_predicates: requestedPredicates
        };
        const schemas = Object.assign({}, attributeSchemas, predicateSchemas);
        const credentialDefinitions = Object.assign({}, attributeCredentialDefinitions, predicateCredentialDefinitions);

        const proof = await sdk.proverCreateProof(
            walletHandle,
            proofRequest,
            requestedCredentials,
            masterSecretId,
            schemas,
            credentialDefinitions,
            {} // no revStates/revocation handling yet
        );

        return {
            id: proofRequest.nonce,
            type: message.messageTypes.PROOF,
            origin: pairwiseInfo['my_did'],
            message: proof
        };
    }
};
