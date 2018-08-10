
const log = require('../util/log').log;
const apiResult = new (require('../util/api-result'))(
  404, {message: 'Sorry, there is nothing here.'});

module.exports = (req, res, next) => {
  log.debug('404 middleware');
  next(apiResult);
};
