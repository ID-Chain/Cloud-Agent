const indy = require('indy-sdk');
const agent = require('superagent');
const uuid = require('uuid/v4');
var fs = require('fs');
const db = require('../persistence/db');
const log = require('../util/log').log;
const connection = require('./connection');
const message = require('./indy-message');
const pool = require('./pool');

const http_secured = process.env.SSL ? 'http://' : 'https://';
const INDY_PATH = `${http_secured}${process.env.DOMAIN_HOST}:${process.env.DOMAIN_PORT}/ca/api/indy/`;
const DID_SEED = process.env.CA_SEED;
const TRUST_ANCHOR_DID = process.env.TRUST_ANCHOR_DID;
const TRUST_ANCHOR_ENPOINT = process.env.TRUST_ANCHOR_ENDPOINT;
const TRUST_ANCHOR_VK = process.env.TRUST_ANCHOR_VERKEY;

class CAWallet {
    constructor(config, credentials) {
        this.config = config;
        this.credentials = credentials;
        this.handle = -1;
        this.ownDid;
    }

    async createWallet() {
        try {
            await indy.createWallet(this.config, this.credentials);
            this.handle = await indy.openWallet(this.config, this.credentials);
             
            const didJSON = DID_SEED ? { seed: DID_SEED } : {};
            const [did, verkey] = await indy.createAndStoreMyDid(this.handle, didJSON);
            this.ownDid = did;
            /**
          * Onboarding of Cloud Agent DID/Verkey by friendly Trust Anchor
          *   

            const request_nonce = uuid();
            const connectionRequest = await connection.createConnectionRequest(this,INDY_PATH, request_nonce)
            await message.sendAnoncryptMessageToEndpoint(TRUST_ANCHOR_VK, TRUST_ANCHOR_ENDPOINT, connectionRequest)
            //const anoncrypted = await this.anonCrypt(TRUST_ANCHOR_DID, message);
*/
            /*
            anoncrypt(message, trust_anchor_did)
            await agent
                .post(`${trust_anchor_endpoint}`)
                .type('application/json')
                .send({message:anoncrypted });
            */
            const caEndpoint = { did: did, verkey: verkey };
            await db.put(this.config.id, caEndpoint);
            fs.writeFile('./ca_endpoint.json', JSON.stringify(caEndpoint), err => {
                if (err) log.error(err);
                log.debug('File ca_endpoint.json with endpoint information on cloud agent saved.');
            });
        } catch (err) {
            log.error(err);
        } finally {
            if (this.handle !== -1) await this.closeWallet();
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

    async anonDecryptToBuffer(recipientDid, messageString) {
        const cryptMessageBuf = Buffer.from(messageString, 'base64');
        const recipientVk = indy.keyForLocalDid(this.handle, recipientDid);
        return await indy.cryptoAnonDecrypt(this.handle, recipientVk, cryptMessageBuf);
    }

    async anonDecrypt(recipientDid, messageString) {
        const decryptedBuffer = await this.anonDecryptToBuffer(recipientDid, messageString);
        const decryptedString = Buffer.from(decryptedBuffer).toString('utf-8');
        return JSON.parse(decryptedString);
    }

    async anonCryptFromBuffer(verKey, messageBuf) {
        return await indy.cryptoAnonCrypt(verKey, messageBuf);
    }

    async anonCrypt(verKey, message) {
        if (typeof message === 'object') {
            message = JSON.stringify(message);
        }
        const messageRaw = Buffer.from(message, 'utf-8');
        const messageBuf = await indy.cryptoAnonCrypt(verKey, messageRaw);
        return messageBuf.toString('base64');
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
