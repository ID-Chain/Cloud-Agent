/**
 * IDChain Agent REST API Routes
 */

const router = require('express').Router();

const walletProvider = require('../middleware/walletProvider');
const message = require('../controllers/message');
const service = require('../controllers/service');
const inbox = require('../controllers/inbox');

router.use(walletProvider.before);

router
    .route('/messages')
    .post(message.send)
    .get(message.retrieve);

router.route('/messages/:id').get(message.retrieve);

router.route('/services').post(service.serve);

router.route('/indy/:id').post(inbox.forward);

router.use(walletProvider.after);

module.exports = router;
