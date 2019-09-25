/**
 * @author wingbot.ai
 */
'use strict';

const { Router, BuildRouter, ai } = require('wingbot');
const { botServiceQuickReplyPatch } = require('wingbot-botservice');
const config = require('../config'); // eslint-disable-line no-unused-vars
const plugins = require('./plugins');
const anonymize = require('./anonymize');

// set the NLP model
ai.register(config.wingbot.ai);

// set a threshold
ai.confidence = 0.85;

// set an anonymization filter
ai.textFilter = anonymize;

function botFactory (forTest = false) { // eslint-disable-line no-unused-vars
    const routerOptions = {};

    const bot = new BuildRouter(config.wingbot, plugins, routerOptions);

    bot.use(botServiceQuickReplyPatch(bot, 'start'));
    // store previous action for analytics purposes
    bot.use((req, res) => {
        const action = req.action();
        if (action) {
            res.setState({ previousAction: action });
        }
        return Router.CONTINUE;
    });

    // attach router middlewares here

    return bot;
}

module.exports = botFactory;
