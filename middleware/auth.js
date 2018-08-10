/**
 * IdChain Agent REST API
 * Authentication and UserProvider Middleware
 */

const bcrypt = require('bcrypt');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

const log = require('../util/log').log;
const User = require('../models/user');

passport.use(
    new BasicStrategy(async (username, password, done) => {
        log.info('auth middleware');
        try {
            const u = await User.findOne({ username: username }).exec();
            if (!u) return done(null, false);
            const match = await bcrypt.compare(password, u.password);
            if (!match) return done(null, false);
            return done(null, u);
        } catch (err) {
            return done(err);
        }
    })
);

module.exports = passport.authenticate('basic', { session: false });
