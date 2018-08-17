const indy = require('indy-sdk');
const agent = require('superagent');
const db = require('./persistence/db');

const log = require('./util/log').log;

class CAWallet {
    constructor(config, credentials) {
        this.config = config;
        this.credentials = credentials;
        this.handle = -1;
    }

    async createWallet() {
        try {
            await indy.createWallet(this.config, this.credentials);
            this.handle = await indy.openWallet(this.config, this.credentials);
            // const didJSON = data.seed ? { seed: data.seed } : {};
            const didJSON = {};
            const [did, verkey] = await indy.createAndStoreMyDid(this.handle, didJSON);
            /**
          * Onboarding of Cloud Agent DID/Verkey by friendly Trust Anchor
          *   

            let message = {
                    id: 'unique_request_nonce_uuid',
                    type: 'urn:sovrin:agent:message_type:sovrin.org/connection_request',
                    message:{
                    did: did,
                    verkey: verkey,
                    endpoint: 'https://example.com/ca/api/blabla',
                    nonce: unique_request_nonce_uuid
                }
            }

            const anoncrypted = await this.anonCrypt(TRUST_ANCHOR_DID, message);

            
            anoncrypt(message, trust_anchor_did)
            await agent
                .post(`${trust_anchor_endpoint}`)
                .type('application/json')
                .send({message:anoncrypted });
             * 
             * 
             * 
             */
            await db.put(this.config.id, did);
        } catch (err) {
            // if (err.indyCode && err.indyCode === 203) {
            return err;
            // } else {
            //     return next(err);
        } finally {
            if (this.handle !== -1) await indy.closeWallet(this.handle);
        }
    }

    async openWallet() {
        log.debug('wallet opening');
        if (this.handle === -1) {
            this.handle = await indy.openWallet(this.config, this.credentials);
        }
    }

    async closeWallet() {
        log.debug('wallet closing');
        if (this.handle !== -1) {
            await indy.closeWallet(this.handle);
            this.handle = -1;
        }
    }

    async removeWallet() {
        log.debug('wallet model pre-remove');
        await this.closeWallet();
        await indy.deleteWallet(this.config, this.credentials);
    }

    async createDid() {
        log.debug('wallet createDid');
        return indy.createAndStoreMyDid(this.handle, {});
    }

    async anonDecrypt(recipientDid, messageString) {
        const cryptMessageBuf = Buffer.from(messageString, 'base64');
        const recipientVk = indy.keyForLocalDid(this.handle, recipientDid);
        return await indy.cryptoAnonDecrypt(this.handle, recipientVk, cryptMessageBuf);
    }

    async anonCrypt(recipientDid, messageBuf) {
        const verKey = indy.keyForLocalDid(this.handle, recipientDid);
        return await indy.cryptoAnonCrypt(anonCryptKey, messageBuf);
    }
}

const wallet = new CAWallet({ id: process.env.CA_WALLET_NAME }, { key: process.env.SECRET });
module.exports = wallet;

/**
 * ToDo: To be implemented if required
 * 
 *  
  schema.method('cryptoSign', async function(signKey, messageBuf) {
    const signature = await indy.cryptoSign(this.handle, signKey, messageBuf);
    return signature.toString('base64');
});

schema.method('cryptoVerify', async function(signerVk, messageBuf, signBuf) {
    return await indy.cryptoVerify(signerVk, messageBuf, signBuf);
});

schema.method('signAndAnonCrypt', async function(signKey, anonCryptKey, messageJson) {
    const messageBuf = Buffer.from(JSON.stringify(messageJson), 'utf-8');
    const signature = await this.cryptoSign(signKey, messageBuf);
    const anonCryptedMessage = await indy.cryptoAnonCrypt(anonCryptKey, messageBuf);
    return [signature, anonCryptedMessage.toString('base64')];
});

schema.method('anonDecryptAndVerify', async function(recipientVk, messageString, signature) {
    const cryptMessageBuf = Buffer.from(messageString, 'base64');
    const messageBuf = await indy.cryptoAnonDecrypt(this.handle, recipientVk, cryptMessageBuf);
    const signBuf = Buffer.from(signature, 'base64');
    const connRes = JSON.parse(messageBuf.toString('utf-8'));
    if (!connRes.verkey) throw new APIResult(400, { message: 'missing signature' });
    const signValid = this.cryptoVerify(connRes.verkey, messageBuf, signBuf);
    if (!signValid) throw new APIResult(400, { message: 'signature mismatch' });
    return connRes;
}); 
*/
