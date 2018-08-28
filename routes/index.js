/**
 * IDChain Agent REST API Routes
 */

const router = require('express').Router();

//const auth = require('../middleware/auth');
const walletProvider = require('../middleware/walletProvider');

/* const user = require('../controllers/user');

const schema = require('../controllers/credentialschema');
const creddef= require('../controllers/credentialdef');
const credential= require('../controllers/credential');
const credoffer= require('../controllers/credentialoffer');
const proof = require('../controllers/proof');
const endpoint = require('../controllers/endpoint'); */
//const connection = require('../controllers/connection');
//const wallet = require('../controllers/wallet');
const message = require('../controllers/message');
const service = require('../controllers/service');
const inbox = require('../controllers/inbox');


router.use(walletProvider.before);
router.param('wallet', walletProvider.param);

router
    .route('/messages')
    // TODO rate-limiting?
    .post(message.send)
    .get(message.retrieve);

router.route('/messages/:id').get(message.retrieve);

router.route('/services').post(service.serve);

router.route('/indy').post(inbox.receive);

router.route('/indy/:id').post(inbox.forward);

router.route('');

router.use(walletProvider.after);

module.exports = router;
