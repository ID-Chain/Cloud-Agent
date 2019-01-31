/**
 * IDChain Cloud Agent REST API
 * Pool Ledger Representation
 */
const PoolLedger = require('./ledger');
const poolLedger = new PoolLedger(process.env.IDC_POOL_NAME, {
    genesis_txn: process.env.IDC_CA_GENESIS_TXN
});

module.exports = poolLedger;
