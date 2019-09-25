/*
 * @author wingbot.ai
 */
'use strict';

const { Processor } = require('wingbot');
const config = require('../config');
const log = require('../lib/log');
const tokenStorage = require('../lib/botTokenStorage');
const stateStorage = require('../lib/stateStorage');
const botFactory = require('./bot');
const { onAction, onEvent } = require('./onAction');

const bot = botFactory();

bot.on('action', onAction);

const processor = new Processor(bot, {
    appUrl: config.appUrl,
    stateStorage,
    tokenStorage,
    log,
    autoTyping: true,
    autoSeen: true
});

processor.on('event', onEvent);


module.exports = processor;
