/**
 * IDChain Agent REST API Routes
 */

const router = require('express').Router();

//const auth = require('../middleware/auth');
/* const walletProvider = require('../middleware/walletProvider');
const user = require('../controllers/user');

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

router
    .route('/messages')
    // TODO rate-limiting?
    .post(message.send)
    .get(message.retrieve);

router.route('/messages/:did').get(message.retrieve);

router.route('/services').post(service.serve);

router.route('/inbox/:id').post(inbox.forward);

router.route('');

/* router.route('/indy')
  .post(endpoint.handle);
 */
// router.use(auth);
// router.use(walletProvider.before);
// router.param('wallet', walletProvider.param);

/* router.route('/user/:user')
  .get(user.retrieve)
  .put(user.update)
  .delete(user.delete); 

router.route('/wallet')
  .get(wallet.list)
  .post(wallet.create);

router.route('/wallet/:wallet')
  .get(wallet.retrieve)
  .delete(wallet.delete);

router.route('/connectionoffer')
  .post(connection.create);

router.route('/connection')
  .post(connection.accept);

*/
// router.use(walletProvider.after);

module.exports = router;
