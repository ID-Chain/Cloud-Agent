/**
 * IDChain Agent REST API
 * Wallet Provider Middleware
 */

const { wrap, wrapEx } = require('../util/asyncwrap');
const APIResult = require('../util/api-result');
const wallet = require('../lib/wallet');
const log = require('../util/log').log;

module.exports = {
    before: wrap(async (req, res, next) => {
        log.debug('walletProvider before');
        await wallet.openWallet();
        req.wallet = wallet;
        next();
    }),

    after: [
        wrap(async (req, res, next) => {
            log.debug('walletProvider after');
            if (req.wallet) await req.wallet.closeWallet();
            next();
        }),
        wrapEx(async (result, req, res, next) => {
            log.debug('walletProvider after with result handler');
            if (req.wallet) await req.wallet.closeWallet();
            next(result);
        })
    ]
};
