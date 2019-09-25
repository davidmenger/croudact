/*
 * @author wingbot.ai
 */
'use strict';
const { BotTokenStorage } = require('wingbot-jwt');
const config = require('../config');

const tokenStorage = new BotTokenStorage(config.jwt.secret, config.jwt.options);

module.exports = tokenStorage;
