const agent = require('superagent');
const uuid = require('uuid/v4');
const indy = require('indy-sdk');
var fs = require('fs');

const db = require('../persistence/db');
const log = require('../util/log').log;

const DID_SEED = process.env.IDC_CA_SEED;

class CAWallet {
    constructor(config, credentials) {
        this.config = config;
        this.credentials = credentials;
        this.handle = -1;
    }

    async createWallet() {
        try {
            // create wallet if it does not exist yet
            await indy.createWallet(this.config, this.credentials);
            await this.openWallet();
            const didJSON = DID_SEED ? { seed: DID_SEED } : {};
            const [did, verkey] = await indy.createAndStoreMyDid(this.handle, didJSON);
            const caEndpoint = { did, verkey };
            await db.put(this.config.id, caEndpoint);
            await new Promise((resolve, reject) => {
                fs.writeFile('./ca_endpoint.json', JSON.stringify(caEndpoint), err => {
                    if (err) {
                        log.error(err);
                        reject(err);
                    } else {
                        log.debug('File ca_endpoint.json with endpoint information on cloud agent saved.');
                        resolve();
                    }
                })
            });
        } catch (err) {
            log.error(err);
        } finally {
            await this.closeWallet();
        }
    }

    async createDid() {
        log.debug('wallet createDid');
        return indy.createAndStoreMyDid(this.handle, {});
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
}

const wallet = new CAWallet({ id: process.env.IDC_CA_WALLET_NAME }, { key: process.env.IDC_CA_SECRET });
module.exports = wallet;
