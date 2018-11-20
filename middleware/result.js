/**
 * IDChain Agent REST API
 * Result Handler
 */

const log = require('../util/log').log;

const internalServerError = 500;
const notFound = 404;
const badRequest = 400;
const indyCodes = {
  // Caller passed invalid value as param 1 (null, invalid json and etc..)
  100: badRequest,

  // Caller passed invalid value as param 2 (null, invalid json and etc..)
  101: badRequest,

  // Caller passed invalid value as param 3 (null, invalid json and etc..)
  102: badRequest,

  // Caller passed invalid value as param 4 (null, invalid json and etc..)
  103: badRequest,

  // Caller passed invalid value as param 5 (null, invalid json and etc..)
  104: badRequest,

  // Caller passed invalid value as param 6 (null, invalid json and etc..)
  105: badRequest,

  // Caller passed invalid value as param 7 (null, invalid json and etc..)
  106: badRequest,

  // Caller passed invalid value as param 8 (null, invalid json and etc..)
  107: badRequest,

  // Caller passed invalid value as param 9 (null, invalid json and etc..)
  108: badRequest,

  // Caller passed invalid value as param 10 (null, invalid json and etc..)
  109: badRequest,

  // Caller passed invalid value as param 11 (null, invalid json and etc..)
  110: badRequest,

  // Caller passed invalid value as param 12 (null, invalid json and etc..)
  111: badRequest,

  // Invalid library state was detected in runtime. It signals library bug
  112: internalServerError,

  // Object (json, config, key, credential and etc...) passed by library caller has invalid structure
  113: badRequest,

  // IO Error
  114: internalServerError,

  // Wallet errors
  // Caller passed invalid wallet handle
  200: badRequest,

  // Unknown type of wallet was passed on create_wallet
  201: badRequest,

  // Attempt to register already existing wallet type
  202: badRequest,

  // Attempt to create wallet with name used for another exists wallet
  203: badRequest,

  // Requested entity id isn't present in wallet
  204: badRequest,

  // Trying to use wallet with pool that has different name
  205: badRequest,

  // Trying to open wallet that was opened already
  206: badRequest,

  // Attempt to open encrypted wallet with invalid credentials
  207: badRequest,

  // Input provided to wallet operations is considered not valid
  208: badRequest,

  // Decoding of wallet data during input/output failed
  209: internalServerError,

  // Storage error occurred during wallet operation
  210: internalServerError,

  // Error during encryption-related operations
  211: internalServerError,

  // Requested wallet item not found
  212: notFound,

  // Returned if wallet's add_record operation is used with record name that already exists
  213: badRequest,

  // Returned if provided wallet query is invalid
  214: badRequest,

  // Ledger errors
  // Trying to open pool ledger that wasn't created before
  300: internalServerError,

  // Caller passed invalid pool ledger handle
  301: badRequest,

  // Pool ledger terminated
  302: internalServerError,

  // No concensus during ledger operation
  303: internalServerError,

  // Attempt to parse invalid transaction response
  304: internalServerError,

  // Attempt to send transaction without the necessary privileges
  305: badRequest,

  // Attempt to create pool ledger config with name used for another existing pool
  306: badRequest,

  // Timeout for action
  307: internalServerError,

  // Attempt to open Pool for witch Genesis Transactions are not compatible with set Protocol version.
  // Call pool.indy_set_protocol_version to set correct Protocol version.
  308: internalServerError,

  // Revocation registry is full and creation of new registry is necessary
  400: badRequest,

  // ?
  401: badRequest,

  // Attempt to generate master secret with duplicated name
  404: badRequest,

  // ?
  405: badRequest,

  406: badRequest,

  // Attempt to create credential definition with duplicated did schema pair
  407: badRequest,

  // Crypto errors
  // Unknown format of DID entity keys
  500: internalServerError,

  // Attempt to create duplicate did
  600: badRequest,

  // Unknown payment method was given
  700: badRequest,

  // No method were scraped from inputs/outputs or more than one were scraped
  701: badRequest,

  // Insufficient funds on inputs
  702: badRequest,
};

module.exports = {
  resultMiddleware: async (result, req, res, next) => {
    log.info('result: ', result);
    if (result instanceof Error || result.error) {
      return next(result.error || result);
    }
    if (result.status) res.status(result.status);
    if (result.data) res.json(result.data);
    res.end();
    if(req.finalCallback) req.finalCallback();
  },
  errorMiddleware: (err, req, res, next) => {
    log.error('error: ', err);
    if (err.indyCode && indyCodes[err.indyCode]) {
      err.status = indyCodes[err.indyCode];
    }
    return res.status(err.status || 500).json({message: err.message});
  },
};
