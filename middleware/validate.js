/**
 * IDChain Agent REST API
 * Validation Middleware
 */
'use strict';

const YAML = require('yamljs');
const ajv = require('ajv')({ removeAdditional: true });
const wrap = require('../util/asyncwrap').wrap;
const APIResult = require('../util/api-result');
const swaggerDoc = YAML.load('./swagger.yaml');

ajv.addSchema(swaggerDoc, 'swagger.json');
const rx = /^\/api\/(\w+)/;

/**
 * Validation Middleware
 * Checks if a schema with ref '#/definitions/path_method exists
 * and applies it if it does
 * @param {object} req expressjs object
 * @param {object} res expressjs object
 * @param {function} next expressjs callback function
 */
async function middleware(req, res, next) {
  const url = req.originalUrl;
  const match = rx.exec(url);
  const vName = (match && match.length > 1) ? `${match[1]}_${req.method.toLowerCase()}` : null;
  const validate = (vName) ? ajv.getSchema(`swagger.json#/definitions/${vName}`) : null;
  const valid = (validate) ? validate(req.body) : true;
  if (!valid) {
    next(new APIResult(400, {message: ajv.errorsText(validate.errors)}));
  } else {
    next();
  }
}

module.exports = wrap(middleware);
