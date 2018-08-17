/**
 * IDChain Agent REST API
 * Wallet Provider Middleware
 */

const { wrap, wrapEx } = require('../util/asyncwrap');
const log = require('../util/log').log;
const NotFound = require('../util/error').NotFound;
const wallet = require('../wallet');

/**
 * Finds and opens the wallet with walletId of user
 * and provides it through req.wallet for further
 * processing
 *
 * ToDo: Provide WalletStorage for Cloud Agent without Mongo
 *
 * @param {Object} req request object
 * @param {String} walletId wallet name
 * @return {Object} the wallet object
 */
async function provideWallet(req) {
    if (!wallet) throw new NotFound('Wallet not found');
    await wallet.openWallet();
    req.wallet = wallet;
    return wallet;
}

module.exports = {
    before: wrap(async (req, res, next) => {
        log.debug('walletProvider before');
        await provideWallet(req);
        next();
    }),

    param: wrapEx(async (req, res, next, walletId) => {
        log.debug('walletProvider param');
        await provideWallet(req);
        next();
    }),

    after: [
        wrap(async (req, res, next) => {
            log.debug('walletProvider after');
            if (req.wallet) await req.wallet.closeWallet();
            next();
        }),
        wrapEx(async (result, req, res, next) => {
            log.debug('walletProvider after result-handler');
            if (req.wallet) await req.wallet.closeWallet();
            next(result);
        })
    ]
};
