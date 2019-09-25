/*
 * @author wingbot.ai
 */
'use strict';

const { BotService } = require('wingbot-botservice');
const { START_ACTION } = require('./actions');
const config = require('../config');
const processor = require('./processor');
const botFactory = require('./bot');
const botSettings = require('./botSettings');

const channel = new BotService(processor, Object.assign({
    // set to null when using an initAction option in the Wingbot Browser Lib
    welcomeAction: START_ACTION
}, config.botService));

module.exports = {
    botSettings,
    botFactory,
    channel
};
